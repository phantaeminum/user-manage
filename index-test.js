/**
 * index-test.js
 * ─────────────────────────────────────────────────────────────
 * Run with: node index-test.js
 * Inserts sample data, then runs .explain("executionStats") on
 * each index type to analyze query performance.
 * ─────────────────────────────────────────────────────────────
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/userManagementDB";

const sampleUsers = [
  { name: "Alice Johnson", email: "alice@example.com", age: 28, hobbies: ["reading", "coding", "hiking"], bio: "Software engineer passionate about open-source development and machine learning" },
  { name: "Bob Smith",     email: "bob@example.com",   age: 35, hobbies: ["gaming", "cooking"],           bio: "Chef by day, gamer by night. Loves Italian cuisine and strategy games" },
  { name: "Carol White",   email: "carol@example.com", age: 22, hobbies: ["painting", "yoga", "reading"], bio: "Artist exploring digital painting and traditional watercolors" },
  { name: "David Lee",     email: "david@example.com", age: 45, hobbies: ["cycling", "photography"],      bio: "Travel photographer cycling across continents documenting local cultures" },
  { name: "Eva Brown",     email: "eva@example.com",   age: 31, hobbies: ["dancing", "coding"],           bio: "Full-stack developer who unwinds with salsa dancing on weekends" },
  { name: "Frank Miller",  email: "frank@example.com", age: 19, hobbies: ["gaming", "reading"],           bio: "Computer science student fascinated by algorithms and competitive programming" },
  { name: "Grace Kim",     email: "grace@example.com", age: 52, hobbies: ["gardening", "cooking"],        bio: "Retired teacher now dedicated to organic gardening and sustainable living" },
  { name: "Henry Patel",   email: "henry@example.com", age: 27, hobbies: ["hiking", "photography"],       bio: "Nature enthusiast capturing wildlife and landscapes through the lens" },
];

// ─── Helper: pretty-print explain stats ──────────────────────────────────────
function printStats(label, stats) {
  const exec = stats.executionStats;
  console.log(`\n${"─".repeat(60)}`);
  console.log(`🔍  ${label}`);
  console.log(`${"─".repeat(60)}`);
  console.log(`  Stage used        : ${exec.executionStages.stage || exec.executionStages.inputStage?.stage}`);
  console.log(`  Keys examined     : ${exec.totalKeysExamined}`);
  console.log(`  Documents examined: ${exec.totalDocsExamined}`);
  console.log(`  Docs returned     : ${exec.nReturned}`);
  console.log(`  Execution time    : ${exec.executionTimeMillis} ms`);
  console.log(`  Index used        : ${exec.executionStages.indexName || exec.executionStages.inputStage?.indexName || "N/A"}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function runTests() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Clean up previous test data
    await User.deleteMany({ email: { $in: sampleUsers.map((u) => u.email) } });
    console.log("🧹 Cleaned up previous test data");

    // Insert sample data
    await User.insertMany(sampleUsers);
    console.log(`✅ Inserted ${sampleUsers.length} sample users`);

    // ── 1. Single Field Index: name ─────────────────────────────────────────
    const nameStats = await User.find({ name: "Alice Johnson" })
      .explain("executionStats");
    printStats("Single Field Index — name: 'Alice Johnson'", nameStats);

    // ── 2. Compound Index: email + age ───────────────────────────────────────
    const compoundStats = await User.find({ email: "bob@example.com", age: 35 })
      .explain("executionStats");
    printStats("Compound Index — email + age", compoundStats);

    // ── 3. Multikey Index: hobbies array ─────────────────────────────────────
    const multikeyStats = await User.find({ hobbies: "coding" })
      .explain("executionStats");
    printStats("Multikey Index — hobbies: 'coding'", multikeyStats);

    // ── 4. Text Index: bio full-text search ──────────────────────────────────
    const textStats = await User.find({ $text: { $search: "developer" } })
      .explain("executionStats");
    printStats("Text Index — bio full-text search: 'developer'", textStats);

    // ── 5. TTL Index: querying by createdAt ──────────────────────────────────
    const ttlStats = await User.find({ createdAt: { $gte: new Date(Date.now() - 86400000) } })
      .explain("executionStats");
    printStats("TTL Index — createdAt (last 24 hours)", ttlStats);

    // ── 6. Age range filter ──────────────────────────────────────────────────
    const ageStats = await User.find({ age: { $gte: 25, $lte: 40 } })
      .explain("executionStats");
    printStats("Age Range Query — age between 25 and 40", ageStats);

    // ── 7. List all indexes ───────────────────────────────────────────────────
    console.log(`\n${"─".repeat(60)}`);
    console.log("📋  All Indexes on 'users' Collection");
    console.log(`${"─".repeat(60)}`);
    const indexes = await User.collection.getIndexes();
    Object.entries(indexes).forEach(([name, index]) => {
      console.log(`  ${name}:`, JSON.stringify(index));
    });

    console.log("\n✅ Index testing complete!\n");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

runTests();
