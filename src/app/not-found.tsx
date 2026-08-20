import Link from "next/link";
export default function NotFound() { return <main className="grid min-h-screen place-items-center bg-black px-6 text-center text-white"><div><p className="text-red-500">404</p><h1 className="mt-2 text-4xl font-bold">Página não encontrada</h1><Link className="mt-6 inline-block rounded-lg bg-red-600 px-5 py-3" href="/">Voltar ao início</Link></div></main>; }
