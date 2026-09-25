const allowedFlows=new Set(["login","register","forgot-password"]);
export default function handler(request,response){
  if(request.method!=="POST")return response.status(405).json({message:"不支援的請求方式。"});
  const {flow,returnTo}=request.body||{};
  if(!allowedFlows.has(flow)||typeof returnTo!=="string"||!returnTo.startsWith("/"))return response.status(400).json({message:"無效的帳號請求。"});
  const endpoint=process.env.AUTH_START_URL;
  if(!endpoint)return response.status(503).json({message:"帳號服務尚未啟用，請稍後再試。"});
  const url=new URL(endpoint);url.searchParams.set("flow",flow);url.searchParams.set("returnTo",returnTo);
  return response.status(200).json({redirectUrl:url.toString()});
}
