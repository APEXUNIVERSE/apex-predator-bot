// Apex Universe Server Constants & Configuration

const GUILD_ID = '1511457449360752690';

// General Roles
const VERIFIED_OPERATOR_ROLE_ID = '1539938913173372980';
const WARZONE_SLAYER_ROLE_ID = '1539938915518255135';

// Squad Combat Roles & Specializations (Temporary Voice-Active Roles)
const COMBAT_ROLES = {
    claim_role_igl: {
        id: '1539947935314346044',
        name: '🧠 IGL (In-Game Leader)',
        short: 'In-Game Leader'
    },
    claim_role_sniper: {
        id: '1539947938493505646',
        name: '🎯 Sniper Specialist',
        short: 'Sniper Specialist'
    },
    claim_role_entry: {
        id: '1539947941744345088',
        name: '⚡ Entry Fragger',
        short: 'Entry Fragger'
    },
    claim_role_support: {
        id: '1539947945062047864',
        name: '🛡️ Support / Anchor',
        short: 'Support / Anchor'
    }
};

const COMBAT_ROLE_IDS = Object.values(COMBAT_ROLES).map(r => r.id);

// Channels
const CHANNELS = {
    OPERATOR_WELCOME: '1539942509550247956',
    SPECIALTY_ROLES: '1539942517523480606',
    VERIFY: '1539942524578304052',
    GENERAL_INTEL: '1539942530752454686',
    GAMER_TAGS: '1539942545944084561',
    AFK_VOICE: '1539947996433621072' // 💤 The Gulag [AFK]
};

module.exports = {
    GUILD_ID,
    VERIFIED_OPERATOR_ROLE_ID,
    WARZONE_SLAYER_ROLE_ID,
    COMBAT_ROLES,
    COMBAT_ROLE_IDS,
    CHANNELS
};
