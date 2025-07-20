import axios from 'axios';

export async function checkFigmaToken(token: string) {
  // Uses /tokens/check endpoint to verify token validity
  try {
    const res = await axios.get('https://forge-deploy-42u1.onrender.com/api/tokens/check', {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Backend should return { valid: boolean } or similar
    return res.data.valid ?? false;
  } catch (e) {
    return false;
  }
}
