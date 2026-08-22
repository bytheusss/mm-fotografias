import {NextResponse} from "next/server";
import {isApiAdmin} from "@/lib/api-auth";
import {supabaseAdmin} from "@/lib/supabaseAdmin";
export async function GET(){if(!(await isApiAdmin()))return NextResponse.json({error:"Acesso negado."},{status:403});const tables=["pricing_packages","promotion_settings","coupons","event_pricing_packages"] as const;const entries=await Promise.all(tables.map(async table=>{const{data}=await supabaseAdmin.from(table).select("*");return[table,data||[]]}));return new NextResponse(JSON.stringify({exportedAt:new Date().toISOString(),version:11,data:Object.fromEntries(entries)},null,2),{headers:{"Content-Type":"application/json","Content-Disposition":`attachment; filename="mm-config-${new Date().toISOString().slice(0,10)}.json"`,"Cache-Control":"no-store"}})}
