﻿module StoryScript {
    export interface IInterfaceTexts {
        equipmentHeader?: string;
        head?: string;
        amulet?: string;
        body?: string;
        hands?: string;
        rightHand?: string;
        leftHand?: string;
        rightRing?: string;
        leftRing?: string;
        legs?: string;
        feet?: string;
        backpack?: string;
        equip?: string;
        use?: string;
        drop?: string;
        enemies?: string;
        attack?: string;
        newGame?: string;
        yourName?: string;
        startAdventure?: string;
        nextQuestion?: string;
        actions?: string;
        destinations?: string;
        back?: string;
        onTheGround?: string;
        youLost?: string;
        questFailed?: string;
        finalScore?: string;
        tryAgain?: string;
        highScores?: string;
        youWon?: string;
        congratulations?: string;
        playAgain?: string;
        startOver?: string;
        resetWorld?: string;
        gameName?: string;
        loading?: string;
        youAreHere?: string;
        messages?: string;
        hitpoints?: string;
        currency?: string;
        trade?: string;
        talk?: string;
        encounters?: string;
        closeModal?: string;
        combatTitle?: string;
        value?: string;
        traderCurrency?: string;
        startCombat?: string;
        combatWin?: string;
        enemiesToFight?: string;

        format?: (template: string, tokens: string[]) => string;
        titleCase?: (text: string) => string;
    }
}