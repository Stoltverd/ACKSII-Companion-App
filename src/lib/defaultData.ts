import { Language, SpellList } from '../types';

export const defaultLanguages: Language[] = [
  { id: '1', name: 'Classical Auran', isDivineOnly: false, rangeMin: 1, rangeMax: 20 },
  { id: '2', name: 'Common', isDivineOnly: false, rangeMin: 21, rangeMax: 30 },
  { id: '3', name: 'Draconic', isDivineOnly: false, rangeMin: 31, rangeMax: 50 },
  { id: '4', name: 'Dwarven', isDivineOnly: true, rangeMin: 51, rangeMax: 70 },
  { id: '5', name: 'Elven', isDivineOnly: false, rangeMin: 71, rangeMax: 90 },
  { id: '6', name: 'Zaharan', isDivineOnly: false, rangeMin: 91, rangeMax: 100 },
];

export const defaultSpellLists: SpellList[] = [
  {
    id: 'arcane_default',
    name: 'Arcane Spells',
    magicType: 'Arcane',
    levels: [
      {
        level: 1,
        spells: [
          { id: 'a1_1', name: 'Arcane Armor' }, { id: 'a1_2', name: 'Auditory Illusion' }, { id: 'a1_3', name: 'Beguile Humanoid' },
          { id: 'a1_4', name: 'Blinding Flash' }, { id: 'a1_5', name: 'Chameleon' }, { id: 'a1_6', name: 'Choking Grip' },
          { id: 'a1_7', name: 'Conjure Cacodemon Spawn' }, { id: 'a1_8', name: 'Counterspell' }, { id: 'a1_9', name: 'Desiccate' },
          { id: 'a1_10', name: 'Discern Gist' }, { id: 'a1_11', name: 'Discern Magic' }, { id: 'a1_12', name: 'Earth’s Excrescence' },
          { id: 'a1_13', name: 'Faithful Companion' }, { id: 'a1_14', name: 'Fan of Flames' }, { id: 'a1_15', name: 'Frighten Humanoid' },
          { id: 'a1_16', name: 'Ice Floe' }, { id: 'a1_17', name: 'Illumination' }, { id: 'a1_18', name: 'Illusory Figment' },
          { id: 'a1_19', name: 'Infuriate Humanoid' }, { id: 'a1_20', name: 'Kindle Flame' }, { id: 'a1_21', name: 'Leaping' },
          { id: 'a1_22', name: 'Mage Missile' }, { id: 'a1_23', name: 'Seal Portal' }, { id: 'a1_24', name: 'Sharpness' },
          { id: 'a1_25', name: 'Shatter Blade' }, { id: 'a1_26', name: 'Silent Step' }, { id: 'a1_27', name: 'Slicing Blow' },
          { id: 'a1_28', name: 'Slickness' }, { id: 'a1_29', name: 'Sling Stone' }, { id: 'a1_30', name: 'Slumber' },
          { id: 'a1_31', name: 'Spider Climbing' }, { id: 'a1_32', name: 'Summon Manes' }, { id: 'a1_33', name: 'Thunderclap' },
          { id: 'a1_34', name: 'Unliving Puppet' }, { id: 'a1_35', name: 'Wall of Smoke' }, { id: 'a1_36', name: 'Weave Smoke' }
        ]
      },
      {
        level: 2,
        spells: [
          { id: 'a2_1', name: 'Adjust Self' }, { id: 'a2_2', name: 'Battering Ram' }, { id: 'a2_3', name: 'Bewitch Humanoid' },
          { id: 'a2_4', name: 'Bloody Flux' }, { id: 'a2_5', name: 'Burning Sparks' }, { id: 'a2_6', name: 'Circling Winds' },
          { id: 'a2_7', name: 'Conjure Imp' }, { id: 'a2_8', name: 'Conjure Petty Elemental' }, { id: 'a2_9', name: 'Dark Whisper' },
          { id: 'a2_10', name: 'Deathless Minion' }, { id: 'a2_11', name: 'Discern Invisible' }, { id: 'a2_12', name: 'Dominate Humanoid' },
          { id: 'a2_13', name: 'Earth’s Wave' }, { id: 'a2_14', name: 'Energy Protection' }, { id: 'a2_15', name: 'Frostbite' },
          { id: 'a2_16', name: 'Halt Humanoids' }, { id: 'a2_17', name: 'Hypnotic Sigil' }, { id: 'a2_18', name: 'Illusory Duplicates' },
          { id: 'a2_19', name: 'Illusory Interior' }, { id: 'a2_20', name: 'Levitation' }, { id: 'a2_21', name: 'Locate Object' },
          { id: 'a2_22', name: 'Magic Lock' }, { id: 'a2_23', name: 'Necromantic Potence' }, { id: 'a2_24', name: 'Ogre Strength' },
          { id: 'a2_25', name: 'Phantasmal Figment' }, { id: 'a2_26', name: 'Physical Protection' }, { id: 'a2_27', name: 'Rain of Vitriol' },
          { id: 'a2_28', name: 'Shrouding Fog' }, { id: 'a2_29', name: 'Sudden Staircase' }, { id: 'a2_30', name: 'Summon Insect Swarm' },
          { id: 'a2_31', name: 'Sunflare' }, { id: 'a2_32', name: 'Swimming' }, { id: 'a2_33', name: 'Vitriolic Infusion' },
          { id: 'a2_34', name: 'Warp Wood' }, { id: 'a2_35', name: 'Webbing' }, { id: 'a2_36', name: 'Weave Fire' }
        ]
      },
      {
        level: 3,
        spells: [
          { id: 'a3_1', name: 'Avian Messenger' }, { id: 'a3_2', name: 'Bewitch Crowd' }, { id: 'a3_3', name: 'Boil Blood' },
          { id: 'a3_4', name: 'Chimerical Figment' }, { id: 'a3_5', name: 'Clairaudiency' }, { id: 'a3_6', name: 'Clairvoyancy' },
          { id: 'a3_7', name: 'Cone of Frost' }, { id: 'a3_8', name: 'Conjure Hellion' }, { id: 'a3_9', name: 'Create Chasm' },
          { id: 'a3_10', name: 'Deflect Ordinary Missiles' }, { id: 'a3_11', name: 'Dismember' }, { id: 'a3_12', name: 'Dispel Magic' },
          { id: 'a3_13', name: 'Dominate Monster' }, { id: 'a3_14', name: 'Earth’s Teeth' }, { id: 'a3_15', name: 'Fireball' },
          { id: 'a3_16', name: 'Gale of Wind' }, { id: 'a3_17', name: 'Flight' }, { id: 'a3_18', name: 'Force of Impetus' },
          { id: 'a3_19', name: 'Growth' }, { id: 'a3_20', name: 'Ice Sheet' }, { id: 'a3_21', name: 'Illumination, Perpetual' },
          { id: 'a3_22', name: 'Inaudibility' }, { id: 'a3_23', name: 'Incite Madness' }, { id: 'a3_24', name: 'Infuriate Crowd' },
          { id: 'a3_25', name: 'Invisibility' }, { id: 'a3_26', name: 'Lightless Vision' }, { id: 'a3_27', name: 'Lightning Strike' },
          { id: 'a3_28', name: 'Rune of Warding' }, { id: 'a3_29', name: 'Skinchange' }, { id: 'a3_30', name: 'Speak with Dead' },
          { id: 'a3_31', name: 'Spellward' }, { id: 'a3_32', name: 'Strengthen the Unliving' }, { id: 'a3_33', name: 'Summon Hellhounds' },
          { id: 'a3_34', name: 'Thunderbolt' }, { id: 'a3_35', name: 'Wall of Thunder' }, { id: 'a3_36', name: 'Water Breathing' }
        ]
      },
      {
        level: 4,
        spells: [
          { id: 'a4_1', name: 'Animate Undead' }, { id: 'a4_2', name: 'Arcane Shift' }, { id: 'a4_3', name: 'Bewitch Monster' },
          { id: 'a4_4', name: 'Cloud of Poison' }, { id: 'a4_5', name: 'Cone of Fear' }, { id: 'a4_6', name: 'Conjure Incubus' },
          { id: 'a4_7', name: 'Conjure Major Elemental' }, { id: 'a4_8', name: 'Earth’s Tremor' }, { id: 'a4_9', name: 'Energy Invulnerability' },
          { id: 'a4_10', name: 'Flesh to Ash' }, { id: 'a4_11', name: 'Giant Strength' }, { id: 'a4_12', name: 'Growth, Plant' },
          { id: 'a4_13', name: 'Guise Self' }, { id: 'a4_14', name: 'Halt Monsters' }, { id: 'a4_15', name: 'Hidden Host' },
          { id: 'a4_16', name: 'Illusory Terrain' }, { id: 'a4_17', name: 'Indiscernibility' }, { id: 'a4_18', name: 'Inferno' },
          { id: 'a4_19', name: 'Iron Maiden' }, { id: 'a4_20', name: 'Locate Treasure' }, { id: 'a4_21', name: 'Magic Carpet' },
          { id: 'a4_22', name: 'Physical Invulnerability' }, { id: 'a4_23', name: 'Safe Travels' }, { id: 'a4_24', name: 'Scouring Zephyr' },
          { id: 'a4_25', name: 'Scry' }, { id: 'a4_26', name: 'Shrieking Skull' }, { id: 'a4_27', name: 'Slumber, Deep' },
          { id: 'a4_28', name: 'Spectral Figment' }, { id: 'a4_29', name: 'Spellward Other' }, { id: 'a4_30', name: 'Sphere of Invulnerability, Lesser' },
          { id: 'a4_31', name: 'Summon Shadow' }, { id: 'a4_32', name: 'Sunder Structure' }, { id: 'a4_33', name: 'Telepathy' },
          { id: 'a4_34', name: 'Wall of Flame' }, { id: 'a4_35', name: 'Wall of Frost' }, { id: 'a4_36', name: 'Weave Water' }
        ]
      },
      {
        level: 5,
        spells: [
          { id: 'a5_1', name: 'Blast Ward' }, { id: 'a5_2', name: 'Capsizing Wave' }, { id: 'a5_3', name: 'Carnage' },
          { id: 'a5_4', name: 'Circle of Agony' }, { id: 'a5_5', name: 'Cone of Paralysis' }, { id: 'a5_6', name: 'Conjure Dybbuk' },
          { id: 'a5_7', name: 'Conjure Supreme Elemental' }, { id: 'a5_8', name: 'Contact Other Sphere' }, { id: 'a5_9', name: 'Control Winds' },
          { id: 'a5_10', name: 'Curse of the Swine' }, { id: 'a5_11', name: 'Deflect Ordinary Weapons' }, { id: 'a5_12', name: 'Dominate Plants' },
          { id: 'a5_13', name: 'Earth’s Mire' }, { id: 'a5_14', name: 'Fillet and Serve' }, { id: 'a5_15', name: 'Firestorm' },
          { id: 'a5_16', name: 'Flay the Slain' }, { id: 'a5_17', name: 'Forest Enchantment' }, { id: 'a5_18', name: 'Forgetfulness' },
          { id: 'a5_19', name: 'Guise Other' }, { id: 'a5_20', name: 'Ice Storm' }, { id: 'a5_21', name: 'Lay of the Land' },
          { id: 'a5_22', name: 'Life Transfer' }, { id: 'a5_23', name: 'Lightless Vision, Mass' }, { id: 'a5_24', name: 'Locate Haunting' },
          { id: 'a5_25', name: 'Mirage' }, { id: 'a5_26', name: 'Phantasmal Horror' }, { id: 'a5_27', name: 'Rouse the Fallen' },
          { id: 'a5_28', name: 'Selective Fire' }, { id: 'a5_29', name: 'Soul Swap' }, { id: 'a5_30', name: 'Spectral Legion' },
          { id: 'a5_31', name: 'Summon Ooze' }, { id: 'a5_32', name: 'Summon Weather' }, { id: 'a5_33', name: 'Telekinesis' },
          { id: 'a5_34', name: 'Teleportation' }, { id: 'a5_35', name: 'Wall of Stone' }, { id: 'a5_36', name: 'X-Ray Vision' }
        ]
      },
      {
        level: 6,
        spells: [
          { id: 'a6_1', name: 'Anti-Magic Sphere' }, { id: 'a6_2', name: 'Banner of Invincibility' }, { id: 'a6_3', name: 'Body Swap' },
          { id: 'a6_4', name: 'Clairaudiency, Greater' }, { id: 'a6_5', name: 'Clairvoyancy, Greater' }, { id: 'a6_6', name: 'Conflagration' },
          { id: 'a6_7', name: 'Conjure Fiend' }, { id: 'a6_8', name: 'Conjure Genie' }, { id: 'a6_9', name: 'Control Weather' },
          { id: 'a6_10', name: 'Disfigure Body and Soul' }, { id: 'a6_11', name: 'Disintegration' }, { id: 'a6_12', name: 'Earth’s Movement' },
          { id: 'a6_13', name: 'Enslave Humanoid' }, { id: 'a6_14', name: 'Level Water' }, { id: 'a6_15', name: 'Locate Distant Object' },
          { id: 'a6_16', name: 'Locate Place of Power' }, { id: 'a6_17', name: 'Madness of Crowds' }, { id: 'a6_18', name: 'Necromantic Invulnerability' },
          { id: 'a6_19', name: 'Panic' }, { id: 'a6_20', name: 'Passageway' }, { id: 'a6_21', name: 'Perpetual Figment' },
          { id: 'a6_22', name: 'Petrification' }, { id: 'a6_23', name: 'Programmatic Figment' }, { id: 'a6_24', name: 'Quest' },
          { id: 'a6_25', name: 'Reveal Ritual Magic' }, { id: 'a6_26', name: 'Soul Eating' }, { id: 'a6_27', name: 'Spellwarded Zone' },
          { id: 'a6_28', name: 'Sphere of Invulnerability, Greater' }, { id: 'a6_29', name: 'Summon Invisible Stalker' }, { id: 'a6_30', name: 'Torpor' },
          { id: 'a6_31', name: 'Transform Other' }, { id: 'a6_32', name: 'Transform Self' }, { id: 'a6_33', name: 'Trollblood' },
          { id: 'a6_34', name: 'Wall of Annihilation' }, { id: 'a6_35', name: 'Wall of Corpses' }, { id: 'a6_36', name: 'Wall of Force' }
        ]
      },
      {
        level: 7,
        spells: [
          { id: 'a7_1', name: 'Ranine Rain' }, { id: 'a7_2', name: 'Seven-League Stride' }, { id: 'a7_3', name: 'Spawn of the Deep' }
        ]
      },
      {
        level: 8,
        spells: [
          { id: 'a8_1', name: 'Emissary' }, { id: 'a8_2', name: 'Consonant Transit' }, { id: 'a8_3', name: 'Consume Power' },
          { id: 'a8_4', name: 'Palace of Sulaimon' }, { id: 'a8_5', name: 'Permanency' }
        ]
      },
      {
        level: 9,
        spells: [
          { id: 'a9_1', name: 'Apotheosis' }, { id: 'a9_2', name: 'Flying Fortress' }, { id: 'a9_3', name: 'Plague' },
          { id: 'a9_4', name: 'Shadeveil' }, { id: 'a9_5', name: 'Undead Legion' }, { id: 'a9_6', name: 'Wish' }
        ]
      }
    ]
  },
  {
    id: 'divine_default',
    name: 'Divine Spells',
    magicType: 'Divine',
    levels: [
      {
        level: 1,
        spells: [
          { id: 'd1_1', name: 'Allure' }, { id: 'd1_2', name: 'Angelic Choir' }, { id: 'd1_3', name: 'Bane-Rune' },
           { id: 'd1_4', name: 'Call of the Wolf' }, { id: 'd1_5', name: 'Counterspell' }, { id: 'd1_6', name: 'Cure Light Injury' },
           { id: 'd1_7', name: 'Cause Light Injury' }, { id: 'd1_8', name: 'Delay Disease' }, { id: 'd1_9', name: 'Destroy Dead' },
           { id: 'd1_10', name: 'Discern Evil' }, { id: 'd1_11', name: 'Discern Good' }, { id: 'd1_12', name: 'Discern Gist' },
           { id: 'd1_13', name: 'Discern Magic' }, { id: 'd1_14', name: 'Discern Poison' }, { id: 'd1_15', name: 'Faithful Companion' },
           { id: 'd1_16', name: 'Frighten Beast' }, { id: 'd1_17', name: 'Holy Circle' }, { id: 'd1_18', name: 'Unholy Circle' },
           { id: 'd1_19', name: 'Illumination' }, { id: 'd1_20', name: 'Tenebrosity' }, { id: 'd1_21', name: 'Infuriate Beast' },
           { id: 'd1_22', name: 'Kindle Flame' }, { id: 'd1_23', name: 'Locate Animal or Plant' }, { id: 'd1_24', name: 'Pass Without Trace' },
           { id: 'd1_25', name: 'Predict Weather' }, { id: 'd1_26', name: 'Purify Food and Water' }, { id: 'd1_27', name: 'Putrefy Food and Water' },
           { id: 'd1_28', name: 'Remove Fear' }, { id: 'd1_29', name: 'Cause Fear' }, { id: 'd1_30', name: 'Salving Rest' },
           { id: 'd1_31', name: 'Sanctuary' }, { id: 'd1_32', name: 'Seal Portal' }, { id: 'd1_33', name: 'Shatter Blade' },
           { id: 'd1_34', name: 'Sling Stone' }, { id: 'd1_35', name: 'Unliving Puppet' }, { id: 'd1_36', name: 'Word of Command' }
        ]
      },
      {
        level: 2,
        spells: [
          { id: 'd2_1', name: 'Augury' }, { id: 'd2_2', name: 'Beguile Humanoid' }, { id: 'd2_3', name: 'Bewitch Beast' },
           { id: 'd2_4', name: 'Call of the Wolf Pack' }, { id: 'd2_5', name: 'Choking Grip' }, { id: 'd2_6', name: 'Circling Winds' },
           { id: 'd2_7', name: 'Cure Moderate Injury' }, { id: 'd2_8', name: 'Cause Moderate Injury' }, { id: 'd2_9', name: 'Dark Whisper' },
           { id: 'd2_10', name: 'Deathless Minion' }, { id: 'd2_11', name: 'Delay Poison' }, { id: 'd2_12', name: 'Discern Bewitchment' },
           { id: 'd2_13', name: 'Indiscernible Bewitchment' }, { id: 'd2_14', name: 'Divine Armor' }, { id: 'd2_15', name: 'Divine Grace' },
           { id: 'd2_16', name: 'Dominate Beasts' }, { id: 'd2_17', name: 'Energy Protection' }, { id: 'd2_18', name: 'Halt Humanoids' },
           { id: 'd2_19', name: 'Holy Blessing' }, { id: 'd2_20', name: 'Unholy Blessing' }, { id: 'd2_21', name: 'Holy Chant' },
           { id: 'd2_22', name: 'Magic Lock' }, { id: 'd2_23', name: 'Necromantic Potence' }, { id: 'd2_24', name: 'Noiselessness' },
           { id: 'd2_25', name: 'Physical Protection' }, { id: 'd2_26', name: 'Righteous Wrath' }, { id: 'd2_27', name: 'Shimmer' },
           { id: 'd2_28', name: 'Slicing Blow' }, { id: 'd2_29', name: 'Slumber' }, { id: 'd2_30', name: 'Speak with Beasts' },
           { id: 'd2_31', name: 'Spiritual Weapon' }, { id: 'd2_32', name: 'Swift Sword' }, { id: 'd2_33', name: 'Transform Beast' }
        ]
      },
      {
        level: 3,
        spells: [
          { id: 'd3_1', name: 'Avian Messenger' }, { id: 'd3_2', name: 'Bewitch Humanoid' }, { id: 'd3_3', name: 'Call of the Wild Bear' },
           { id: 'd3_4', name: 'Clairaudiency' }, { id: 'd3_5', name: 'Clairvoyancy' }, { id: 'd3_6', name: 'Cure Blindness' },
           { id: 'd3_7', name: 'Cause Blindness' }, { id: 'd3_8', name: 'Cure Disease' }, { id: 'd3_9', name: 'Cause Disease' },
           { id: 'd3_10', name: 'Cure Major Injury' }, { id: 'd3_11', name: 'Cause Major Injury' }, { id: 'd3_12', name: 'Deflect Ordinary Missiles' },
           { id: 'd3_13', name: 'Discern Curse' }, { id: 'd3_14', name: 'Indiscernible Curse' }, { id: 'd3_15', name: 'Discern Invisible' },
           { id: 'd3_16', name: 'Dispel Magic' }, { id: 'd3_17', name: 'Divine Protection' }, { id: 'd3_18', name: 'Growth, Beast' },
           { id: 'd3_19', name: 'Holy Circle, Sustained' }, { id: 'd3_20', name: 'Unholy Circle, Sustained' }, { id: 'd3_21', name: 'Holy Prayer' },
           { id: 'd3_22', name: 'Illumination, Perpetual' }, { id: 'd3_23', name: 'Tenebrosity, Perpetual' }, { id: 'd3_24', name: 'Invulnerability to Evil' },
           { id: 'd3_25', name: 'Invulnerability to Good' }, { id: 'd3_26', name: 'Lightning Strike' }, { id: 'd3_27', name: 'Phantasmal Figment' },
           { id: 'd3_28', name: 'Remove Curse' }, { id: 'd3_29', name: 'Bestow Curse' }, { id: 'd3_30', name: 'Rune of Warding' },
           { id: 'd3_31', name: 'Speak with Dead' }, { id: 'd3_32', name: 'Spellward' }, { id: 'd3_33', name: 'Strengthen the Unliving' },
           { id: 'd3_34', name: 'Striking' }, { id: 'd3_35', name: 'Swift Sword, Sustained' }, { id: 'd3_36', name: 'Water Breathing' },
           { id: 'd3_37', name: 'Water Walking' }, { id: 'd3_38', name: 'Winged Flight' }
        ]
      },
      {
        level: 4,
        spells: [
          { id: 'd4_1', name: 'Angelic Aura' }, { id: 'd4_2', name: 'Call of the Galloping Herd' }, { id: 'd4_3', name: 'Call of the Regal Pride' },
           { id: 'd4_4', name: 'Crafting' }, { id: 'd4_5', name: 'Create Water' }, { id: 'd4_6', name: 'Cure Serious Injury' },
           { id: 'd4_7', name: 'Cause Serious Injury' }, { id: 'd4_8', name: 'Death Ward' }, { id: 'd4_9', name: 'Dismember' },
           { id: 'd4_10', name: 'Divination' }, { id: 'd4_11', name: 'Energy Invulnerability' }, { id: 'd4_12', name: 'Gale of Wind' },
           { id: 'd4_13', name: 'Growth' }, { id: 'd4_14', name: 'Shrinking' }, { id: 'd4_15', name: 'Inaudibility' },
           { id: 'd4_16', name: 'Indiscernibility' }, { id: 'd4_17', name: 'Inspire Awe' }, { id: 'd4_18', name: 'Inspire Horror' },
           { id: 'd4_19', name: 'Invisibility' }, { id: 'd4_20', name: 'Lightless Vision' }, { id: 'd4_21', name: 'Neutralize Poison' },
           { id: 'd4_22', name: 'Poison' }, { id: 'd4_23', name: 'Physical Invulnerability' }, { id: 'd4_24', name: 'Protection from Temperature' },
           { id: 'd4_25', name: 'Repair Disfigurement & Disability' }, { id: 'd4_26', name: 'Cause Disfigurement and Disability' }, { id: 'd4_27', name: 'Skinchange' },
           { id: 'd4_28', name: 'Smite Undead' }, { id: 'd4_29', name: 'Animate Undead' }, { id: 'd4_30', name: 'Snakes to Staffs' },
           { id: 'd4_31', name: 'Staffs to Snakes' }, { id: 'd4_32', name: 'Speak with Plants' }, { id: 'd4_33', name: 'Spellward Other' },
           { id: 'd4_34', name: 'Sphere of Invulnerability, Lesser' }, { id: 'd4_35', name: 'Spirit of Healing' }, { id: 'd4_36', name: 'Sunflare' },
           { id: 'd4_37', name: 'Tongues' }
        ]
      },
      {
        level: 5,
        spells: [
          { id: 'd5_1', name: 'Atonement' }, { id: 'd5_2', name: 'Blast Ward' }, { id: 'd5_3', name: 'Boil Blood' },
           { id: 'd5_4', name: 'Call of the Great Cats' }, { id: 'd5_5', name: 'Communion' }, { id: 'd5_6', name: 'Cone of Fear' },
           { id: 'd5_7', name: 'Control Winds' }, { id: 'd5_8', name: 'Create Food' }, { id: 'd5_9', name: 'Cure Critical Injury' },
           { id: 'd5_10', name: 'Cause Critical Injury' }, { id: 'd5_11', name: 'Curse of the Swine' }, { id: 'd5_12', name: 'Deflect Ordinary Weapons' },
           { id: 'd5_13', name: 'Dominate Monster' }, { id: 'd5_14', name: 'Fate' }, { id: 'd5_15', name: 'Fiery Pillar' },
           { id: 'd5_16', name: 'Giant Strength' }, { id: 'd5_17', name: 'Growth, Plant' }, { id: 'd5_18', name: 'Guise Self' },
           { id: 'd5_19', name: 'Healing Circle' }, { id: 'd5_20', name: 'Lay of the Land' }, { id: 'd5_21', name: 'Locate Haunting' },
           { id: 'd5_22', name: 'Restore Life and Limb' }, { id: 'd5_23', name: 'Extinguish Life' }, { id: 'd5_24', name: 'Safe Travels' },
           { id: 'd5_25', name: 'Scry' }, { id: 'd5_26', name: 'Spiritwalk' }, { id: 'd5_27', name: 'Strength of Mind' },
           { id: 'd5_28', name: 'Weakness of Mind' }, { id: 'd5_29', name: 'Summon Insect Plague' }, { id: 'd5_30', name: 'Sword of Fire' },
           { id: 'd5_31', name: 'True Seeing' }, { id: 'd5_32', name: 'Turn to Dust' }, { id: 'd5_33', name: 'Vigor' }
        ]
      },
      {
        level: 6,
        spells: [
          { id: 'd6_1', name: 'Anti-Magic Sphere' }, { id: 'd6_2', name: 'Arrows of the Sun' }, { id: 'd6_3', name: 'Banner of Invincibility' },
           { id: 'd6_4', name: 'Barrier of Blades' }, { id: 'd6_5', name: 'Bath of the Goddess' }, { id: 'd6_6', name: 'Bewitch Monster' },
           { id: 'd6_7', name: 'Blast Ward, Greater' }, { id: 'd6_8', name: 'Call of the Ancient Tusk' }, { id: 'd6_9', name: 'Call of the Aerophract Steeds' },
           { id: 'd6_10', name: 'Clairaudiency, Greater' }, { id: 'd6_11', name: 'Clairvoyancy, Greater' }, { id: 'd6_12', name: 'Dispel Evil' },
           { id: 'd6_13', name: 'Dispel Good' }, { id: 'd6_14', name: 'Fillet and Serve' }, { id: 'd6_15', name: 'Flesh to Ash' },
           { id: 'd6_16', name: 'Guise Other' }, { id: 'd6_17', name: 'Hidden Host' }, { id: 'd6_18', name: 'Home Ward' },
           { id: 'd6_19', name: 'Illusory Terrain' }, { id: 'd6_20', name: 'Level Water' }, { id: 'd6_21', name: 'Locate Place of Power' },
           { id: 'd6_22', name: 'Phoenix Aura' }, { id: 'd6_23', name: 'Prophetic Dream' }, { id: 'd6_24', name: 'Quest' },
           { id: 'd6_25', name: 'Salvific Rain' }, { id: 'd6_26', name: 'Slumber, Deep' }, { id: 'd6_27', name: 'Spectral Figment' },
           { id: 'd6_28', name: 'Spellwarded Zone' }, { id: 'd6_29', name: 'Sphere of Invulnerability, Greater' }, { id: 'd6_30', name: 'Summon Weather' },
           { id: 'd6_31', name: 'Summon Winged Herald' }
        ]
      },
      {
        level: 7,
        spells: [
          { id: 'd7_1', name: 'Harvest' }, { id: 'd7_2', name: 'Ravage' }, { id: 'd7_3', name: 'Magic Mushrooms' },
           { id: 'd7_4', name: 'Ranine Rain' }, { id: 'd7_5', name: 'Seven-League Stride' }, { id: 'd7_6', name: 'Spawn of the Deep' },
           { id: 'd7_7', name: 'Youthfulness' }
        ]
      },
      {
        level: 8,
        spells: [
          { id: 'd8_1', name: 'Resurrection' }, { id: 'd8_2', name: 'Destruction' }, { id: 'd8_3', name: 'Permanency' },
           { id: 'd8_4', name: 'Consume Power' }, { id: 'd8_5', name: 'Consonant Transit' }
        ]
      },
      {
        level: 9,
        spells: [
          { id: 'd9_1', name: 'Apotheosis' }, { id: 'd9_2', name: 'Cataclysm' }, { id: 'd9_3', name: 'Miracle' }
        ]
      }
    ]
  }
];
