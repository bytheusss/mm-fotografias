import {NextResponse} from "next/server";
import {supabaseAdmin} from "@/lib/supabaseAdmin";
import {orderPhotos} from "@/lib/orders";

async function context(token:string){
 const{data:order}=await supabaseAdmin.from("orders").select("id,name,status,photos").eq("review_token",token).maybeSingle();
 if(!order||order.status!=="paid")return null;
 const ids=orderPhotos(order.photos).map(photo=>photo.id).filter(Boolean) as string[];
 const{data:photos}=ids.length?await supabaseAdmin.from("photos").select("photographer_id,profiles(id,full_name,avatar_url)").in("id",ids):{data:[]};
 const people=new Map<string,{id:string;full_name?:string;avatar_url?:string}>();
 for(const row of photos||[]){const profile=Array.isArray(row.profiles)?row.profiles[0]:row.profiles;if(row.photographer_id&&profile)people.set(row.photographer_id,profile)}
 const{data:reviews}=await supabaseAdmin.from("purchase_reviews").select("id,target_type,photographer_id,rating,comment,published").eq("order_id",order.id);
 return{order,photographers:[...people.values()],reviews:reviews||[]};
}
export async function GET(_request:Request,{params}:{params:Promise<{token:string}>}){const{token}=await params;const data=await context(token);return data?NextResponse.json(data):NextResponse.json({error:"Convite inválido ou compra ainda não aprovada."},{status:404})}
export async function POST(request:Request,{params}:{params:Promise<{token:string}>}){const{token}=await params,data=await context(token);if(!data)return NextResponse.json({error:"Convite inválido."},{status:404});const body=await request.json(),target=body.targetType==="photographer"?"photographer":"studio",photographerId=target==="photographer"?String(body.photographerId||""):null,rating=Number(body.rating);if(!Number.isInteger(rating)||rating<1||rating>5)return NextResponse.json({error:"Escolha de 1 a 5 estrelas."},{status:400});if(target==="photographer"&&!data.photographers.some(person=>person.id===photographerId))return NextResponse.json({error:"Fotógrafo não pertence a este pedido."},{status:400});const payload={order_id:data.order.id,target_type:target,photographer_id:photographerId,customer_name:String(data.order.name||"Cliente").slice(0,100),rating,comment:String(body.comment||"").trim().slice(0,800)||null,published:false};const{error}=await supabaseAdmin.from("purchase_reviews").insert(payload);if(error?.code==="23505")return NextResponse.json({error:"Você já avaliou esse destino neste pedido."},{status:409});return error?NextResponse.json({error:error.message},{status:400}):NextResponse.json({success:true})}
