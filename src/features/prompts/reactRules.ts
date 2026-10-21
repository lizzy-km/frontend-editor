import { REACT_RULES_APP } from './reactRulesApp'
import { REACT_RULES_QUALITY } from './reactRulesQuality'
import { REACT_RULES_STACK } from './reactRulesStack'

/**
 * Part 2 of the prompt for a React + TypeScript project (the third choice in the AI helper): the answer format, the stack, the folders, pages,
 * sign-in, mock data, responsive and accessible pages, clean code, design and a final check. The stack matches the projects Tweak downloads
 * (features/export/react), so keep the versions in `reactRulesStack.ts` in step with `export/react/projectTemplates.ts`.
 */
export const REACT_RULES = `${REACT_RULES_STACK}

${REACT_RULES_APP}

${REACT_RULES_QUALITY}`
