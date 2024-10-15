export const inference = async (prompt:string):Promise<string> =>{
  const response = await fetch(
    String(process.env.INFERENCE_URL),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${String(process.env.API_KEY)}`
      },
      body: JSON.stringify({
        model: String(process.env.MODEL_NAME),
        mesage: {
          role: 'user',
          content: {
            type: 'text',
            text: prompt
          }
        },
        stream: false
      })
    }
  )
  if (!response.ok) {
    throw new Error(`Fail to inference: ${response.statusText}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
}