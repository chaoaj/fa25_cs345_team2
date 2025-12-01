// --- Tweak these to balance the game ---
const HEAL_SPELL_COST   = 3;  // mana cost to cast
const HEAL_SPELL_AMOUNT = 1;  // HP restored per cast
// ----------------------------------------

// Main method added onto Player
Player.prototype.castHealSpell = function () {
  // Make sure Player has a heal() method from your health UI file
  if (typeof this.heal !== "function") {
    console.error("Player.castHealSpell: this.heal() is not defined yet.");
    return false;
  }

  // Already full HP
  if (this.hp >= this.maxHP) {
    // Optional - play a "no effect" sound or text here.
    return false;
  }

  // Not enough mana
  if (this.mana < HEAL_SPELL_COST) {
    // Optional - show "Not enough mana" feedback.
    return false;
  }

  // Spend mana and heal
  this.mana -= HEAL_SPELL_COST;
  this.heal(HEAL_SPELL_AMOUNT);

  return true; // Spell succeeded
};
