use socketioxide::socket::Sid;

use crate::Player;
use crate::Level;

use std::sync::{Arc, Mutex};
use std::collections::HashMap;

type PlayerList = Arc<Mutex<HashMap<Sid ,Player>>>;

#[derive(Debug, Clone)]
pub struct Game { // should do all the game's calculations ?????
    pub scenario: Level,
    pub players: PlayerList, 
}

impl Game {
    /// Returns a new game-loop
    ///
    /// ## Arguments
    ///
    /// * `scenario` - A Level instance, that holds the current map logic
    ///
    pub fn new(scenario: Level) -> Self {
        let players: PlayerList = Arc::new(Mutex::new(HashMap::new()));;

        Game { scenario, players }
    }

    /// Add a new player to the game's player_list
    ///
    /// ## Arguments
    ///
    /// * `player` - Player instance
    pub fn join(&mut self, mut player: Player) {
        let mut players = self.players.lock().unwrap();
        player.location = self.scenario.get_spawn();
        players.insert(player.id, player);
    }

    /// Remove a player from the game's player_list
    ///
    /// ## Arguments
    ///
    /// * `id` - Socket connection's ID value
    pub fn disconnect(&mut self, id: Sid) {
        let mut players = self.players.lock().unwrap();
        players.remove(&id);
        
    }

    // Example method to update the player's location
    pub fn update(&mut self) {
        

    }

    pub fn init(&mut self) {
        loop {
            self.update();
        }
    }
}