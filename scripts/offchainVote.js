// Simulated off-chain voting result

const votes = [
  { voter: "0xA1", choice: "FOR", weight: 5 },
  { voter: "0xB2", choice: "FOR", weight: 3 },
  { voter: "0xC3", choice: "AGAINST", weight: 1 },
];

let forVotes = 0;
let againstVotes = 0;

for (const v of votes) {
  if (v.choice === "FOR") forVotes += v.weight;
  if (v.choice === "AGAINST") againstVotes += v.weight;
}

console.log("FOR:", forVotes);
console.log("AGAINST:", againstVotes);

if (forVotes > againstVotes) {
  console.log("Proposal PASSED → Trigger on-chain execution");
} else {
  console.log("Proposal FAILED");
}
