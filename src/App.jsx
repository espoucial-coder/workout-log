import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Save, Calendar, Check, History } from 'lucide-react';

export default function App() {
  // 오늘 날짜 기본값 (YYYY.MM.DD)
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const [currentDate, setCurrentDate] = useState(getTodayString());
  const [exercises, setExercises] = useState([
    { id: 1, name: '푸시업', count: '10x3' },
    { id: 2, name: '허리강화', count: '10x3' }
  ]);
  const [memo, setMemo] = useState('유혹에 지배되다가 이겨냄');
  const [allLogs, setAllLogs] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // 로컬스토리지에서 기록 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('sheet_workout_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAllLogs(parsed);
        if (parsed[currentDate]) {
          setExercises(parsed[currentDate].exercises || []);
          setMemo(parsed[currentDate].memo || '');
        }
      } catch (e) {
        console.error("데이터 로드 실패", e);
      }
    }
  }, []);

  // 날짜 변경 시 해당 날짜 기록 가져오기
  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
    setIsSaved(false);
    if (allLogs[newDate]) {
      setExercises(allLogs[newDate].exercises || []);
      setMemo(allLogs[newDate].memo || '');
    } else {
      setExercises([{ id: Date.now(), name: '', count: '' }]);
      setMemo('');
    }
  };

  // 날짜 하루 이동
  const shiftDate = (days) => {
    const [y, m, d] = currentDate.split('.').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    handleDateChange(`${year}.${month}.${day}`);
  };

  // 운동 항목 추가
  const addExerciseRow = () => {
    setExercises([...exercises, { id: Date.now(), name: '', count: '' }]);
    setIsSaved(false);
  };

  // 운동 항목 삭제
  const removeExerciseRow = (id) => {
    setExercises(exercises.filter(item => item.id !== id));
    setIsSaved(false);
  };

  // 운동 항목 내용 수정
  const updateExercise = (id, field, value) => {
    setExercises(exercises.map(item => item.id === id ? { ...item, [field]: value } : item));
    setIsSaved(false);
  };

  // 데이터 저장
  const handleSave = () => {
    const updated = {
      ...allLogs,
      [currentDate]: {
        exercises,
        memo,
        updatedAt: new Date().toISOString()
      }
    };
    setAllLogs(updated);
    localStorage.setItem('sheet_workout_logs', JSON.stringify(updated));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // 기록된 날짜 목록
  const recordedDates = Object.keys(allLogs).sort().reverse();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-3 sm:p-6 font-sans text-slate-800">
      {/* 메인 스프레드시트 스타일 카드 */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-md border border-slate-300 overflow-hidden">
        
        {/* 헤더 바 */}
        <div className="bg-slate-700 text-white p-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-slate-300" />
            <h1 className="font-bold text-lg tracking-wide">운동 일지</h1>
          </div>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs bg-slate-600 hover:bg-slate-500 text-slate-200 px-2.5 py-1.5 rounded flex items-center space-x-1 transition"
          >
            <History className="w-3.5 h-3.5" />
            <span>기록목록</span>
          </button>
        </div>

        {/* 날짜 선택 헤더 */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center justify-between">
          <button 
            onClick={() => shiftDate(-1)}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-slate-500">날짜</span>
            <input 
              type="text" 
              value={currentDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="font-mono text-base font-bold bg-white border border-slate-300 rounded px-2 py-0.5 text-center w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button 
            onClick={() => shiftDate(1)}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 히스토리 모달/드롭다운 */}
        {showHistory && (
          <div className="bg-slate-800 text-white p-3 text-sm border-b border-slate-700 max-h-48 overflow-y-auto">
            <div className="font-bold text-slate-400 mb-2 text-xs">작성된 날짜 목록 (클릭하여 이동)</div>
            {recordedDates.length === 0 ? (
              <div className="text-slate-500 text-xs italic py-1">저장된 기록이 없습니다.</div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {recordedDates.map(d => (
                  <button
                    key={d}
                    onClick={() => {
                      handleDateChange(d);
                      setShowHistory(false);
                    }}
                    className={`text-left px-2 py-1 rounded text-xs transition ${d === currentDate ? 'bg-blue-600 font-bold' : 'bg-slate-700 hover:bg-slate-600'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 그리드 표 영역 */}
        <div className="p-3">
          <table className="w-full border-collapse border border-slate-300 text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-xs font-semibold">
                <th className="border border-slate-300 p-2 text-left w-1/2">운동 이름</th>
                <th className="border border-slate-300 p-2 text-left w-1/3">횟수 / 세트</th>
                <th className="border border-slate-300 p-1 text-center w-12">삭제</th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="border border-slate-300 p-1">
                    <input
                      type="text"
                      placeholder="예: 푸시업"
                      value={item.name}
                      onChange={(e) => updateExercise(item.id, 'name', e.target.value)}
                      className="w-full p-1 bg-transparent focus:outline-none font-medium text-slate-800"
                    />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <input
                      type="text"
                      placeholder="예: 10x3"
                      value={item.count}
                      onChange={(e) => updateExercise(item.id, 'count', e.target.value)}
                      className="w-full p-1 bg-transparent font-mono focus:outline-none text-slate-700"
                    />
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <button
                      onClick={() => removeExerciseRow(item.id)}
                      className="text-slate-400 hover:text-red-500 p-1 transition"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 행 추가 버튼 */}
          <button
            onClick={addExerciseRow}
            className="w-full mt-2 py-1.5 border border-dashed border-slate-300 rounded text-slate-500 text-xs hover:bg-slate-50 hover:text-slate-700 flex items-center justify-center space-x-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>운동 항목 추가</span>
          </button>

          {/* 소감 / 기록 영역 */}
          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-500 mb-1">
              기록 / 느낀 점 (소감)
            </label>
            <textarea
              rows={3}
              placeholder="오늘 운동에 대한 소감이나 메모를 남기세요..."
              value={memo}
              onChange={(e) => {
                setMemo(e.target.value);
                setIsSaved(false);
              }}
              className="w-full p-2.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800 resize-none"
            />
          </div>

          {/* 저장 버튼 */}
          <button
            onClick={handleSave}
            className={`w-full mt-4 py-2.5 rounded font-bold text-sm text-white flex items-center justify-center space-x-1.5 shadow transition ${
              isSaved ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>저장 완료!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>저장하기</span>
              </>
            )}
          </button>
        </div>

        {/* 푸터 안내 */}
        <div className="bg-slate-50 border-t border-slate-200 p-2 text-center text-xs text-slate-400">
          * 기기 브라우저(LocalStorage)에 안전하게 저장됩니다.
        </div>
      </div>
    </div>
  );
}