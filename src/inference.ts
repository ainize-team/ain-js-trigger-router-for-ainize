import { Ollama } from 'ollama'
export const inference = async (prompt:string):Promise<string> =>{
  const OLLAMA_URL = process.env.OLLAMA_URL
  const ollama = new Ollama({ host: OLLAMA_URL })
  const response = await ollama.generate({
    model: 'gemma2:27b-instruct-fp16',
    prompt: prompt,
  })
return response.response
}