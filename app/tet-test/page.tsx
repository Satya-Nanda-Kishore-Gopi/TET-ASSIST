'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Question={question_id:number;subject:string;question:string;option_a:string;option_b:string;option_c:string;option_d:string;question_order:number};
type Test={id:string;title:string;duration_minutes:number;total_questions:number};

const TEST_ID='c97f31ea-1125-4ff7-84bc-d9e52f2c3803';

export default function TetTestPage(){
 const router=useRouter();
 const [test,setTest]=useState<Test|null>(null),[questions,setQuestions]=useState<Question[]>([]);
 const [attemptId,setAttemptId]=useState<string|null>(null),[answers,setAnswers]=useState<Record<number,number>>({});
 const [current,setCurrent]=useState(0),[seconds,setSeconds]=useState(0),[loading,setLoading]=useState(true);
 const [error,setError]=useState(''),[submitting,setSubmitting]=useState(false),[saving,setSaving]=useState(false);

 useEffect(()=>{(async()=>{try{
  const r=await fetch('/api/tet/tests/'+TEST_ID); const d=await r.json();
  if(!r.ok||!d.success) throw new Error(d.error||'Failed to load test.');
  setTest(d.test);setQuestions(d.questions);setSeconds(d.test.duration_minutes*60);
  const a=await fetch('/api/tet/attempts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({testId:d.test.id})});
  const ad=await a.json(); if(!a.ok||!ad.success) throw new Error(ad.error||'Failed to start test.');
  setAttemptId(ad.attemptId);setSeconds(ad.durationMinutes*60);
 }catch(e){setError(e instanceof Error?e.message:'Failed to start test.')}finally{setLoading(false)}})()},[]);

 useEffect(()=>{if(!attemptId||submitting||seconds<=0)return;const t=window.setInterval(()=>setSeconds(s=>s-1),1000);return()=>window.clearInterval(t)},[attemptId,submitting,seconds]);
 useEffect(()=>{if(seconds===0&&attemptId&&!submitting)submit(true)},[seconds,attemptId,submitting]);

 const time=useMemo(()=>String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0'),[seconds]);
 const q=questions[current];

 async function choose(option:number){if(!attemptId||!q||submitting)return;setAnswers(a=>({...a,[q.question_id]:option}));setSaving(true);try{
  const r=await fetch('/api/tet/attempts/'+attemptId+'/answers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({questionId:q.question_id,selectedOption:option})});
  const d=await r.json();if(!r.ok||!d.success)throw new Error(d.error||'Could not save answer.');
 }catch(e){setError(e instanceof Error?e.message:'Could not save answer.')}finally{setSaving(false)}}

 async function submit(expired=false){if(!attemptId||submitting)return;setSubmitting(true);try{
  const r=await fetch('/api/tet/attempts/'+attemptId+'/complete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({expired})});
  const d=await r.json();if(!r.ok||!d.success)throw new Error(d.error||'Could not submit test.');
  sessionStorage.setItem('tet-result',JSON.stringify(d.result));router.push('/tet-result');
 }catch(e){setError(e instanceof Error?e.message:'Could not submit test.');setSubmitting(false)}}

 if(loading)return <main className="min-h-screen grid place-items-center">Loading TET test...</main>;
 if(error&&!q)return <main className="min-h-screen grid place-items-center p-6"><div className="text-center"><h1 className="text-2xl font-bold">Unable to start test</h1><p className="mt-2 text-red-600">{error}</p></div></main>;
 if(!q||!test)return null;

 const opts=[q.option_a,q.option_b,q.option_c,q.option_d];
 return <main className="min-h-screen bg-slate-50 p-4 sm:p-6"><div className="mx-auto max-w-6xl">
  <header className="mb-4 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
   <div><p className="text-xs font-bold text-emerald-600">TET ASSIST</p><h1 className="text-lg font-bold">{test.title}</h1><p className="text-sm text-slate-500">Question {current+1} of {questions.length} • {q.subject}</p></div>
   <div className="flex gap-2"><span className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold">Answered {Object.keys(answers).length}/{questions.length}</span><span className="rounded-xl bg-red-50 px-4 py-2 text-lg font-bold text-red-700">{time}</span></div>
  </header>
  {error&&<div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
  <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
   <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-7"><span className="text-sm font-semibold text-emerald-700">Question {q.question_order}</span><h2 className="mt-3 text-lg font-semibold leading-8">{q.question}</h2>
    <div className="mt-6 space-y-3">{opts.map((text,i)=>{const n=i+1,selected=answers[q.question_id]===n;return <button key={n} onClick={()=>choose(n)} className={'w-full rounded-xl border p-4 text-left '+(selected?'border-emerald-600 bg-emerald-50':'border-slate-200 hover:border-emerald-400')}><b className="mr-3">{String.fromCharCode(64+n)}.</b>{text}</button>})}</div>
    <div className="mt-7 flex items-center justify-between"><button disabled={current===0} onClick={()=>setCurrent(v=>v-1)} className="rounded-xl border px-5 py-3 font-semibold disabled:opacity-40">Previous</button><span className="text-xs text-slate-500">{saving?'Saving...':'Answer saved'}</span>{current===questions.length-1?<button disabled={submitting} onClick={()=>submit(false)} className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white">Submit Test</button>:<button onClick={()=>setCurrent(v=>v+1)} className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white">Next</button>}</div>
   </section>
   <aside className="rounded-2xl bg-white p-4 shadow-sm"><h3 className="mb-3 font-bold">Questions</h3><div className="grid grid-cols-5 gap-2">{questions.map((x,i)=><button key={x.question_id} onClick={()=>setCurrent(i)} className={'h-9 rounded-lg text-xs font-bold '+(current===i?'bg-emerald-600 text-white':answers[x.question_id]?'bg-emerald-100 text-emerald-800':'bg-slate-100')}>{i+1}</button>)}</div></aside>
  </div>
 </div></main>
}