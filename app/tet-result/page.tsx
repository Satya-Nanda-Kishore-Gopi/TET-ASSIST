'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
export default function TetResultPage(){
 const router=useRouter();const [r,setR]=useState<any>(null);
 useEffect(()=>{const x=sessionStorage.getItem('tet-result');if(!x){router.replace('/tests');return}setR(JSON.parse(x))},[router]);
 if(!r)return <main className="min-h-screen grid place-items-center">Loading result...</main>;
 const pct=r.totalMarks?Math.round(r.score/r.totalMarks*100):0;
 return <main className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-sm">
  <p className="font-bold text-emerald-600">TET ASSIST</p><h1 className="mt-2 text-3xl font-bold">Test Result</h1>
  <p className="mt-2 text-slate-500">{r.status==='expired'?'Time expired. The test was submitted automatically.':'Test submitted successfully.'}</p>
  <div className="my-8 text-6xl font-extrabold text-emerald-600">{r.score}/{r.totalMarks}</div><p className="text-lg font-semibold">{pct}%</p>
  <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Correct',r.correct,'bg-emerald-50'],['Incorrect',r.incorrect,'bg-red-50'],['Unanswered',r.unanswered,'bg-slate-100'],['Answered',r.answered,'bg-blue-50']].map(([a,b,c])=><div key={String(a)} className={'rounded-xl p-4 '+c}><b className="block text-2xl">{b}</b><span className="text-xs">{a}</span></div>)}</div>
  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
   <button onClick={()=>r.attemptId && router.push('/tet-review/'+r.attemptId)} className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white">Review Answers</button>
   <button onClick={()=>router.push('/tests')} className="rounded-xl border border-slate-200 px-6 py-3 font-semibold">Back to Tests</button>
  </div>
 </div></main>
}