namespace MyRolePlayingGame {
    // Calling this function will bootstrap the game using our game namespace and rules and text objects.
    StoryScript.Run('MyRolePlayingGame', new CustomTexts().texts, new Rules());
}