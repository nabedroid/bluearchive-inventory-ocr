import React, { useState, useCallback } from 'react'
import { ImageUploader } from '@common/components/ImageUploader'
import { AnalysisProgress, type AnalysisProgressProps } from '@common/components/AnalysisProgress'
import { ItemDataExtractService } from './services/itemDataExtractService'
import { ItemMasterData, type ItemMasterDataJson } from '@common/services/itemMasterService';
import { IconFeatureService } from '@common/services/iconFeatureService'
import { fromDataUrl, fromFile, toBase64 } from '@common/utils/mat';

declare const cv: any;

function App() {
  const [files, setFiles] = useState<File[]>([])
  const [items, setItems] = useState<ItemMasterData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<AnalysisProgressProps | null>(null)

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // 辞書 JSON のインポート
  const handleImportJSON = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as ItemMasterDataJson[]
        setItems(data.map((item) => ItemMasterData.fromJson(item)))
      } catch (err) {
        alert('JSON のパースに失敗しました')
      }
    }
    reader.readAsText(file)
  }, [])

  const handleFilesSelected = useCallback((files: File[]) => {
    setFiles((prev: File[]) => [...prev, ...files])
  }, [])

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev: File[]) => prev.filter((_, i) => i !== index))
  }, [])

  // 解析処理 (1枚から1アイテム)
  const handleAnalyze = useCallback(async () => {
    if (files.length === 0) return;
    setIsLoading(true);

    try {
      using itemDataExtractService = ItemDataExtractService.getInstance();
      const newItems: ItemMasterData[] = [];

      // 画像ごとに処理
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress({ percent: (i / files.length) * 100, message: `画像読み込み中: ${file.name}` });

        // 画像の読み込み
        const src = await fromFile(file);

        setProgress({ percent: (i / files.length) * 100 + 20, message: `アイテム情報抽出中...` });

        // アイテム情報の抽出
        const results = await itemDataExtractService.extractAsync(src);

        for (const result of results) {
          // 抽出結果の追加
          newItems.push(result);
        }

        src.delete();
      }

      setItems((prev) => [...prev, ...newItems]);
      setFiles([]); // 解析後はクリア
      setProgress({ percent: 100, message: '完了' });
    } catch (e: any) {
      console.error(e);
      setProgress({ percent: 0, message: `エラー: ${e.message}` });
    } finally {
      setIsLoading(false);
    }
  }, [files, items.length]);

  const handleUpdateItem = (index: number, field: keyof ItemMasterData, value: any) => {
    setItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }
    setItems((prev: ItemMasterData[]) => {
      const updated = [...prev]
      const temp = updated[draggedIndex]
      updated.splice(draggedIndex, 1)
      updated.splice(index, 0, temp)
      return updated
    })
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleRemoveItem = (index: number) => {
    setItems((prev: ItemMasterData[]) => prev.filter((_, i) => i !== index))
  }

  // 特徴量と色情報を再計算
  const handleRecalculateFeatures = useCallback(async () => {
    using iconFeatureService = IconFeatureService.getInstance();

    if (items.length === 0) return;

    setIsLoading(true);
    setProgress({ percent: 0, message: '全アイテムの特徴量と色情報を再計算中...' });

    try {
      const updatedItems = [...items];
      for (let i = 0; i < updatedItems.length; i++) {
        const item = updatedItems[i];

        setProgress({ percent: (i / updatedItems.length) * 100, message: `再計算中: ${item.name || `アイテム #${i + 1}`}` });

        const mat = await fromDataUrl(item.iconDataUrl);
        const descriptors = iconFeatureService.computeFeatures(mat);
        const colorHash = iconFeatureService.computeColorHash(mat);

        item.features = toBase64(descriptors);
        item.colorHash = colorHash;

        mat.delete();
        descriptors.delete();
      }

      setItems(updatedItems);
      setProgress({ percent: 100, message: '再計算完了！' });
    } catch (e: any) {
      console.error(e);
      setProgress({ percent: 0, message: `エラー: ${e.message}` });
    } finally {
      setIsLoading(false);
    }
  }, [items]);

  const handleExportJSON = useCallback(() => {
    const json = JSON.stringify(items, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'item-master.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [items])

  return (
    <div className="app" style={{ fontSize: '0.9rem' }}>
      <header style={{
        padding: '8px 16px',
        backgroundColor: '#264278',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h1 style={{ margin: 0, fontSize: '1.1rem' }}>ブルーアーカイブ アイテムマスター作成ツール</h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Import:</span>
            <input type="file" accept=".json" onChange={handleImportJSON} style={{ fontSize: '0.8rem', width: '180px' }} />
          </div>
          <button
            onClick={handleRecalculateFeatures}
            disabled={items.length === 0 || isLoading}
            style={{
              padding: '4px 12px',
              backgroundColor: '#e1b12c', // yellow/gold for regenerate
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: items.length === 0 || isLoading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              opacity: items.length === 0 || isLoading ? 0.5 : 1
            }}
          >
            特徴量再計算
          </button>
          <button
            onClick={handleExportJSON}
            style={{
              padding: '4px 12px',
              backgroundColor: '#4a69bd',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.8rem'
            }}
          >
            Export JSON ({items.length})
          </button>
        </div>
      </header>

      <main style={{ padding: '12px' }}>
        {/* 操作エリア */}
        <section style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '15px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          alignItems: 'flex-start',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ flex: 1 }}>
            <ImageUploader
              files={files}
              onFilesSelected={handleFilesSelected}
              onRemoveFile={handleRemoveFile}
            />
          </div>
          <div style={{ width: '220px' }}>
            <button
              onClick={handleAnalyze}
              disabled={files.length === 0 || isLoading}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#e55039',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginBottom: '5px'
              }}
            >
              {isLoading ? '分析中...' : '画像から抽出'}
            </button>
            {progress && <AnalysisProgress {...progress} />}
          </div>
        </section>

        {/* 編集グリッド */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {items.map((item, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={handleDragEnd}
              style={{
                border: draggedIndex === idx ? '2px dashed #4a69bd' : (dragOverIndex === idx ? '2px solid #e55039' : '1px solid #dee2e6'),
                opacity: draggedIndex === idx ? 0.5 : 1,
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: dragOverIndex === idx ? '#f8d7da' : 'white',
                width: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                cursor: 'grab',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '5px' }}>
                <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'bold' }}>#{idx + 1}</span>
                <button
                  onClick={() => handleRemoveItem(idx)}
                  style={{
                    color: '#e55039',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    lineHeight: 1,
                    padding: 0
                  }}
                  title="削除"
                >
                  ×
                </button>
              </div>
              <img src={item.iconDataUrl} alt="" style={{ height: '64px', display: 'block', border: '1px solid #ccc', margin: '5px 0' }} />
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                style={{ width: '100%', padding: '2px 4px', fontSize: '0.8rem', textAlign: 'center', boxSizing: 'border-box' }}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default App
