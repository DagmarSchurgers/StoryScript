describe("DataService", function() {

    beforeEach(() => {
        // Trigger object factory initialization.
        StoryScript.ObjectFactory.GetGame();
    });

    it("should create and save a JSON clone of the world", function() {
        var game = StoryScript.ObjectFactory.GetGame();

        // Initialize the world so it is available for saving.
        var locationService = StoryScript.ObjectFactory.GetLocationService();
        locationService.init(game, true);

        var expected = {"data":[{"name":"Basement","destinations":[{"name":"To the garden","target":"Garden"}],"items":[{"name":"Joe's journal","equipmentType":10,"id":"journal","type":"items"}],"id":"basement","type":"locations","actions":[],"combatActions":[],"features":[],"enemies":[],"persons":[]},{"name":"Dirt road","destinations":[{"name":"Enter your home","target":"Start"}],"enemies":[{"name":"Bandit","hitpoints":10,"attack":"1d6","items":[{"name":"Sword","damage":"3","equipmentType":6,"value":5,"id":"sword","type":"items"},{"name":"Basement key","keepAfterUse":false,"open":{"name":"Open","action":"function#item_basementkey_open_action#2105684126"},"equipmentType":10,"id":"basementkey","type":"items"}],"id":"bandit","type":"enemies"}],"combatActions":[{"text":"Run back inside","execute":"function#location_dirtroad_combatActions_0_execute#1353273504"}],"id":"dirtroad","type":"locations","actions":[],"features":[],"items":[],"persons":[]},{"name":"Garden","destinations":[{"name":"Enter your home","target":"Start"}],"enterEvents":["function#location_garden_enterEvents_0#1554729503"],"actions":[{"text":"Search the Shed","execute":"function#location_garden_actions_0_execute#1876985113"},{"text":"Look in the pond","execute":"function#location_garden_actions_1_execute#-1200667825"}],"id":"garden","type":"locations","combatActions":[],"features":[],"items":[],"enemies":[],"persons":[]},{"name":"Bedroom","destinations":[{"name":"Back to the living room","target":"Start"}],"trade":{"title":"Your personal closet","description":"Do you want to take something out of your closet or put it back in?","buy":{"description":"Take out of closet","emptyText":"The closet is empty","itemSelector":"function#location_bedroom_trade_buy_itemSelector#775087826","maxItems":5,"priceModifier":0},"sell":{"description":"Put back in closet","emptyText":"You have nothing to put in the your closet","itemSelector":"function#location_bedroom_trade_sell_itemSelector#775087826","maxItems":5,"priceModifier":"function#location_bedroom_trade_sell_priceModifier#-50287"}},"id":"bedroom","type":"locations","actions":[],"combatActions":[],"features":[],"items":[],"enemies":[],"persons":[]},{"name":"Home","descriptionSelector":"function#location_start_descriptionSelector#430859754","destinations":[{"name":"To the bedroom","target":"Bedroom"},{"name":"To the garden","target":"Garden"},{"name":"Out the front door","target":"DirtRoad"}],"persons":[{"name":"Joe","hitpoints":10,"attack":"1d6","items":[{"name":"Sword","damage":"3","equipmentType":6,"value":5,"id":"sword","type":"items"}],"currency":10,"trade":{"ownItemsOnly":true,"buy":{"description":"I'm willing to part with these items...","emptyText":"I have nothing left to sell to you...","itemSelector":"function#person_friend_trade_buy_itemSelector#775087826","maxItems":5},"sell":{"description":"These items look good, I'd like to buy them from you","emptyText":"You have nothing left that I'm interested in","itemSelector":"function#person_friend_trade_sell_itemSelector#775087826","maxItems":5}},"conversation":{"actions":{"addHedgehog":"function#person_friend_conversation_actions_addHedgehog#1236730917"}},"quests":[{"name":"Find Joe's journal","status":"function#quest_journal_status#-579014216","start":"function#quest_journal_start#-1164492381","checkDone":"function#quest_journal_checkDone#-6643860","complete":"function#quest_journal_complete#1437431166","id":"journal","type":"quests"}],"id":"friend","type":"persons"}],"id":"start","type":"locations","actions":[],"combatActions":[],"features":[],"items":[],"enemies":[]}]};
        var expectedString = JSON.stringify(expected);

        var storageService = getStorageService();
        var service = new StoryScript.DataService(storageService, 'MyNewGame');
        service.save('game', game.locations);
        var result = storageService.value;
        expect(result).not.toBe(null);
        expect(result).toBe(expectedString);
    });

    function getStorageService() {
        var service = {
            value: null,
            set: function(key, data) {
                this.value = data;
            }
        }

        return service;
    }
});