export const inference = async (prompt:string):Promise<string> =>{
  console.log(String(process.env.INFERENCE_URL))
  console.log(String(process.env.API_KEY))
  console.log(String(process.env.MODEL_NAME))
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
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    }
  )
  if (!response.ok) {
    throw new Error(`Fail to inference: ${JSON.stringify(await response.json())}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
}