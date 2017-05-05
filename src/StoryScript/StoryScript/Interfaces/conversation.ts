﻿module StoryScript {
    export interface IConversation {
        title?: string;
        selectActiveNode?: (game: IGame, person: IPerson) => IConversationNode;
        showUnavailableReplies?: boolean;
        prepareReplies?(game: IGame, person: IPerson, node: IConversationNode): void;
        handleReply?(game: IGame, person: IPerson, node: IConversationNode, reply: IConversationReply): void;
        nodes?: ICollection<IConversationNode>;
        activeNode?: IConversationNode;
        conversationLog?: IConversationLogEntry[];
        ended?: boolean;
    }

    export interface IConversationNode {
        active?: boolean;
        node: string;
        lines: string;
        replies?: ICollection<IConversationReply>;
        next?: string;
    }

    export interface IConversationReply {
        requires?: string;
        lines?: string;
        linkToNode?: string;
        available?: boolean;
        showWhenUnavailable?: boolean;
        questStart?: string;
        questComplete?: string;
    }

    export interface IConversationLogEntry {
        lines: string;
        reply: string;
    }
}