/**
 * Jest typings don't expose MatcherState, which is what is actually passed in with
 * expect.extend().  Here we redeclare MatcherUtils to extend MatcherState.
 */

declare namespace jest {
    interface MatcherState {
        currentTestName: string;
        isNot: boolean;
        testPath: string;

    }
    interface MatcherUtils extends MatcherState {
    }
}