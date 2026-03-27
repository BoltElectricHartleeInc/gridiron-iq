import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateRecruits, type Recruit } from '../data/recruits';

export interface RecruitConversationMessage {
  id: string;
  role: 'coach' | 'recruit';
  content: string;
  interestDelta: number;
  timestamp: number;
}

export interface RecruitConversation {
  recruitId: string;
  schoolId: string;
  messages: RecruitConversationMessage[];
  totalInterestGained: number;
  callCount: number;
}

interface RecruitingState {
  // Your school
  userSchoolId: string | null;
  userSchoolName: string;
  userSchoolConference: string;
  userSchoolNFLDraftPicks: number;
  userSchoolChampionships: number;
  userSchoolFacilitiesRating: number;
  userSchoolAcademicsRating: number;
  userSchoolPrestige: number;

  // Recruitment state
  recruits: Recruit[];
  conversations: Record<string, RecruitConversation>;
  offeredScholarships: Set<string>;

  // Resources
  callsRemainingThisWeek: number;
  visitsRemainingThisSeason: number;
  recruitingBudget: number;
  weekNumber: number;

  // Committed class
  committedClass: string[];

  // Actions
  setSchool: (schoolId: string, name: string, conference: string, prestige: number) => void;
  makePhoneCall: (recruitId: string) => boolean;
  scheduleVisit: (recruitId: string) => boolean;
  addConversationMessage: (recruitId: string, msg: RecruitConversationMessage) => void;
  updateInterest: (recruitId: string, delta: number) => void;
  offerScholarship: (recruitId: string) => void;
  advanceWeek: () => void;
  processAIRecruitmentWeekly: () => void;
  checkForCommitments: () => string[];
  resetRecruiting: () => void;
}

// Seeded RNG for AI weekly processing (stable per week)
function weeklyRng(seed: number) {
  let s = (seed * 9301 + 49297) % 233280;
  return s / 233280;
}

const INITIAL_STATE = {
  userSchoolId: null as string | null,
  userSchoolName: '',
  userSchoolConference: '',
  userSchoolNFLDraftPicks: 0,
  userSchoolChampionships: 0,
  userSchoolFacilitiesRating: 5,
  userSchoolAcademicsRating: 5,
  userSchoolPrestige: 50,
  recruits: generateRecruits(),
  conversations: {} as Record<string, RecruitConversation>,
  offeredScholarships: new Set<string>(),
  callsRemainingThisWeek: 10,
  visitsRemainingThisSeason: 5,
  recruitingBudget: 2.5,
  weekNumber: 1,
  committedClass: [] as string[],
};

// Prestige tier data for rival schools
const PRESTIGE_SCHOOLS: Record<string, { nfl: number; champs: number; facilities: number; academics: number; prestige: number; conf: string }> = {
  'UGA':  { nfl: 22, champs: 3, facilities: 9, academics: 7, prestige: 95, conf: 'SEC' },
  'ALA':  { nfl: 28, champs: 4, facilities: 10, academics: 6, prestige: 98, conf: 'SEC' },
  'OSU':  { nfl: 25, champs: 2, facilities: 9, academics: 7, prestige: 94, conf: 'Big Ten' },
  'BAMA': { nfl: 28, champs: 4, facilities: 10, academics: 6, prestige: 98, conf: 'SEC' },
  'UF':   { nfl: 18, champs: 2, facilities: 8, academics: 7, prestige: 87, conf: 'SEC' },
  'LSU':  { nfl: 20, champs: 2, facilities: 9, academics: 6, prestige: 88, conf: 'SEC' },
  'OHIO': { nfl: 25, champs: 2, facilities: 9, academics: 7, prestige: 94, conf: 'Big Ten' },
  'ND':   { nfl: 14, champs: 1, facilities: 9, academics: 10, prestige: 90, conf: 'Ind' },
  'CLEM': { nfl: 18, champs: 2, facilities: 9, academics: 7, prestige: 89, conf: 'ACC' },
  'PSU':  { nfl: 16, champs: 1, facilities: 8, academics: 8, prestige: 86, conf: 'Big Ten' },
  'MICH': { nfl: 17, champs: 2, facilities: 9, academics: 9, prestige: 91, conf: 'Big Ten' },
  'TEX':  { nfl: 19, champs: 2, facilities: 10, academics: 7, prestige: 90, conf: 'SEC' },
  'USC':  { nfl: 21, champs: 2, facilities: 9, academics: 8, prestige: 88, conf: 'Big Ten' },
  'FSU':  { nfl: 15, champs: 1, facilities: 8, academics: 7, prestige: 83, conf: 'ACC' },
  'OKLA': { nfl: 16, champs: 1, facilities: 8, academics: 7, prestige: 82, conf: 'SEC' },
  'TENN': { nfl: 14, champs: 1, facilities: 9, academics: 7, prestige: 83, conf: 'SEC' },
  'MISS': { nfl: 12, champs: 0, facilities: 7, academics: 6, prestige: 76, conf: 'SEC' },
  'AUB':  { nfl: 15, champs: 1, facilities: 8, academics: 6, prestige: 80, conf: 'SEC' },
  'OREG': { nfl: 14, champs: 1, facilities: 9, academics: 7, prestige: 84, conf: 'Big Ten' },
  'WASH': { nfl: 10, champs: 0, facilities: 8, academics: 8, prestige: 78, conf: 'Big Ten' },
};

function computeSchoolFit(recruit: Recruit, schoolId: string): number {
  const school = PRESTIGE_SCHOOLS[schoolId];
  if (!school) return 30;
  const p = recruit.priorities;
  let score = 0;
  score += (school.nfl / 3) * (p.nflPipeline / 10);
  score += (school.facilities / 10) * 10 * (p.facilities / 10);
  score += (school.champs * 10) * (p.winningCulture / 10);
  score += (school.prestige / 10) * (p.exposure / 10);
  score += (school.academics / 10) * 10 * (p.academics / 10);
  return Math.min(85, Math.max(5, Math.round(score)));
}

export const useRecruitingStore = create<RecruitingState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setSchool: (schoolId, name, conference, prestige) => {
        set({
          userSchoolId: schoolId,
          userSchoolName: name,
          userSchoolConference: conference,
          userSchoolPrestige: prestige,
          // Infer school stats from prestige
          userSchoolNFLDraftPicks: Math.round((prestige / 100) * 30),
          userSchoolChampionships: prestige > 90 ? 3 : prestige > 80 ? 2 : prestige > 70 ? 1 : 0,
          userSchoolFacilitiesRating: Math.round(1 + (prestige / 100) * 9),
          userSchoolAcademicsRating: 5 + Math.floor(Math.random() * 4),
        });
      },

      makePhoneCall: (recruitId) => {
        const state = get();
        if (state.callsRemainingThisWeek <= 0) return false;
        if (!state.userSchoolId) return false;

        set(s => {
          const recruits = s.recruits.map(r => {
            if (r.id !== recruitId) return r;
            return { ...r, callCount: r.callCount + 1 };
          });
          // Ensure conversation exists
          const convKey = recruitId;
          const conversations = { ...s.conversations };
          if (!conversations[convKey]) {
            conversations[convKey] = {
              recruitId,
              schoolId: s.userSchoolId!,
              messages: [],
              totalInterestGained: 0,
              callCount: 0,
            };
          }
          conversations[convKey] = {
            ...conversations[convKey],
            callCount: conversations[convKey].callCount + 1,
          };
          return {
            recruits,
            conversations,
            callsRemainingThisWeek: s.callsRemainingThisWeek - 1,
          };
        });
        return true;
      },

      scheduleVisit: (recruitId) => {
        const state = get();
        if (state.visitsRemainingThisSeason <= 0) return false;
        if (!state.userSchoolId) return false;
        const recruit = state.recruits.find(r => r.id === recruitId);
        if (!recruit) return false;
        if (recruit.hasVisit[state.userSchoolId]) return false;

        set(s => {
          const schoolId = s.userSchoolId!;
          const recruits = s.recruits.map(r => {
            if (r.id !== recruitId) return r;
            const visitBonus = 15 + Math.floor(Math.random() * 11); // +15 to +25
            const newInterest = Math.min(100, (r.schoolInterest[schoolId] ?? 0) + visitBonus);
            return {
              ...r,
              hasVisit: { ...r.hasVisit, [schoolId]: true },
              schoolInterest: { ...r.schoolInterest, [schoolId]: newInterest },
            };
          });
          return {
            recruits,
            visitsRemainingThisSeason: s.visitsRemainingThisSeason - 1,
          };
        });
        return true;
      },

      addConversationMessage: (recruitId, msg) => {
        set(s => {
          const key = recruitId;
          const existing = s.conversations[key] ?? {
            recruitId,
            schoolId: s.userSchoolId ?? '',
            messages: [],
            totalInterestGained: 0,
            callCount: 0,
          };
          return {
            conversations: {
              ...s.conversations,
              [key]: {
                ...existing,
                messages: [...existing.messages, msg],
                totalInterestGained: existing.totalInterestGained + (msg.interestDelta > 0 ? msg.interestDelta : 0),
              },
            },
          };
        });
      },

      updateInterest: (recruitId, delta) => {
        const state = get();
        if (!state.userSchoolId) return;
        const schoolId = state.userSchoolId;
        set(s => ({
          recruits: s.recruits.map(r => {
            if (r.id !== recruitId) return r;
            const current = r.schoolInterest[schoolId] ?? 0;
            const updated = Math.max(0, Math.min(100, current + delta));
            return {
              ...r,
              schoolInterest: { ...r.schoolInterest, [schoolId]: updated },
            };
          }),
        }));
      },

      offerScholarship: (recruitId) => {
        const state = get();
        if (!state.userSchoolId) return;
        const schoolId = state.userSchoolId;
        set(s => {
          const newOffered = new Set(s.offeredScholarships);
          newOffered.add(recruitId);
          // Small interest bump for receiving an offer
          const recruits = s.recruits.map(r => {
            if (r.id !== recruitId) return r;
            const current = r.schoolInterest[schoolId] ?? 0;
            const bump = current < 30 ? 15 : 5;
            return {
              ...r,
              schoolInterest: { ...r.schoolInterest, [schoolId]: Math.min(100, current + bump) },
            };
          });
          return { offeredScholarships: newOffered, recruits };
        });
      },

      processAIRecruitmentWeekly: () => {
        const state = get();
        const week = state.weekNumber;

        set(s => {
          const recruits = s.recruits.map(r => {
            if (r.committedTo) return r;

            let schoolInterest = { ...r.schoolInterest };

            // Each competitor school makes weekly moves
            for (const school of r.topCompetitors) {
              const seedVal = parseInt(r.id.replace(/\D/g, ''), 10) + week * 137 + school.charCodeAt(0);
              const rand = weeklyRng(seedVal);
              const current = schoolInterest[school] ?? 0;

              // Elite schools push harder on top recruits
              const schoolPrestige = PRESTIGE_SCHOOLS[school]?.prestige ?? 60;
              const aggressiveness = (schoolPrestige / 100) * 0.7 + 0.3;

              if (rand < aggressiveness * 0.6) {
                // Made a call / sent pitch
                const fit = computeSchoolFit(r, school);
                const callGain = Math.floor(fit * 0.08 + rand * 4);
                schoolInterest[school] = Math.min(85, current + callGain);
              } else if (rand > 0.92) {
                // Decay — school got busy with other recruits
                schoolInterest[school] = Math.max(0, current - 2);
              }
            }

            // Check AI commitment (week 8+, school reaches 85+ and recruit is offered)
            if (week >= 8 && r.stars <= 3) {
              for (const school of r.topCompetitors) {
                const interest = schoolInterest[school] ?? 0;
                const commitSeed = parseInt(r.id.replace(/\D/g, ''), 10) + week * 53 + school.charCodeAt(1);
                const commitRoll = weeklyRng(commitSeed);
                if (interest >= 80 && commitRoll < 0.25) {
                  // This school lands the recruit
                  return { ...r, committedTo: school, schoolInterest };
                }
              }
            }

            // Decay interest for user's school if no contact this week
            if (s.userSchoolId) {
              const userCurrent = schoolInterest[s.userSchoolId] ?? 0;
              if (userCurrent > 0) {
                schoolInterest[s.userSchoolId] = Math.max(0, userCurrent - 1);
              }
            }

            return { ...r, schoolInterest };
          });

          return { recruits };
        });
      },

      checkForCommitments: () => {
        const state = get();
        if (!state.userSchoolId) return [];
        const schoolId = state.userSchoolId;
        const newCommits: string[] = [];

        set(s => {
          const recruits = s.recruits.map(r => {
            if (r.committedTo) return r; // already committed somewhere
            if (!s.offeredScholarships.has(r.id)) return r; // no offer extended

            const interest = r.schoolInterest[schoolId] ?? 0;
            if (interest >= 85) {
              newCommits.push(r.id);
              return { ...r, committedTo: schoolId };
            }
            return r;
          });

          const committedClass = [
            ...s.committedClass,
            ...newCommits.filter(id => !s.committedClass.includes(id)),
          ];

          return { recruits, committedClass };
        });

        return newCommits;
      },

      advanceWeek: () => {
        const state = get();
        if (state.weekNumber >= 20) return;

        // First process AI, then advance week
        get().processAIRecruitmentWeekly();

        set(s => ({
          weekNumber: s.weekNumber + 1,
          callsRemainingThisWeek: 10,
        }));

        // Check for new commits after week advances
        get().checkForCommitments();
      },

      resetRecruiting: () => {
        set({
          ...INITIAL_STATE,
          recruits: generateRecruits(),
          offeredScholarships: new Set<string>(),
        });
      },
    }),
    {
      name: 'recruiting-store-v1',
      // Custom serializer because Set isn't JSON-serializable
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            const parsed = JSON.parse(str);
            if (parsed?.state?.offeredScholarships) {
              parsed.state.offeredScholarships = new Set(parsed.state.offeredScholarships);
            }
            return parsed;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            const toStore = {
              ...value,
              state: {
                ...value.state,
                offeredScholarships: Array.from(value.state.offeredScholarships ?? []),
              },
            };
            localStorage.setItem(name, JSON.stringify(toStore));
          } catch {
            // quota exceeded or private mode
          }
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectCommittedRecruits = (state: RecruitingState) =>
  state.recruits.filter(r => r.committedTo === state.userSchoolId);

export const selectAvailableRecruits = (state: RecruitingState) =>
  state.recruits.filter(r => !r.committedTo);

export const selectRecruitInterest = (state: RecruitingState, recruitId: string): number => {
  const recruit = state.recruits.find(r => r.id === recruitId);
  if (!recruit || !state.userSchoolId) return 0;
  return recruit.schoolInterest[state.userSchoolId] ?? 0;
};

export const selectClassGrade = (state: RecruitingState): string => {
  const committed = state.recruits.filter(r => r.committedTo === state.userSchoolId);
  if (committed.length === 0) return 'N/A';
  const avg = committed.reduce((sum, r) => sum + r.compositeScore, 0) / committed.length;
  if (avg >= 0.97) return 'A+';
  if (avg >= 0.94) return 'A';
  if (avg >= 0.91) return 'A-';
  if (avg >= 0.88) return 'B+';
  if (avg >= 0.85) return 'B';
  if (avg >= 0.82) return 'B-';
  if (avg >= 0.79) return 'C+';
  return 'C';
};
