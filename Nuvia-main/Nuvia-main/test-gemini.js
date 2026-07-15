const apiKey = "AQ.Ab8RN6JfPRVv5eAwot3rZl0G5kSOc75ysrTxKxfunt45YXg9Ow";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
})
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);
