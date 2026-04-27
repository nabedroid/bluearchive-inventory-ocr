import React from 'react';
import type { AnalyzedItem } from '@common/types';
import { ItemMasterData } from '@common/services/itemMasterService';

interface SummaryViewProps {
  results: AnalyzedItem[];
  masterData: ItemMasterData[];
}

const SCHOOLS = ['百鬼夜行', 'レッドウィンター', 'トリニティ', 'ゲヘナ', 'アビドス', 'ミレニアム', 'アリウス', '山海経', 'ヴァルキューレ', 'ハイランダー', 'ワイルドハント'];

const TIERS = ['初級', '中級', '上級', '最上級'];

const OOPARTS_TABLE_1 = [
  { name: 'ネブラディスク', items: ['ネブラディスクの欠片', '壊れたネブラディスク', '摩耗したネブラディスク', '完全なネブラディスク'], top: '完全なネブラディスク' },
  { name: 'ファイストス円盤', items: ['ファイストス円盤の欠片', '壊れたファイストス円盤', '摩耗したファイストス円盤', '完全なファイストス円盤'], top: '完全なファイストス円盤' },
  { name: 'ヴォルフスエック', items: ['ヴォルフスエックの鉄鉱石', 'ヴォルフスエック鋼鉄の欠片', '低純度のヴォルフスエック鋼鉄', '高純度のヴォルフスエック鋼鉄'], top: '高純度のヴォルフスエック鋼鉄' },
  { name: 'ニムルドレンズ', items: ['ニムルドレンズの欠片', '壊れたニムルドレンズ', '摩耗したニムルドレンズ', '完全なニムルドレンズ'], top: '完全なニムルドレンズ' },
  { name: 'マンドレイク', items: ['マンドレイクの種', 'マンドレイクの芽', 'マンドレイクジュース', 'マンドレイク濃縮液'], top: 'マンドレイク濃縮液' },
  { name: 'レヒニッツ', items: ['レヒニッツ写本のページ', '傷んだレヒニッツ写本', '編集済みのレヒニッツ写本', '完全なレヒニッツ写本'], top: '完全なレヒニッツ写本' },
  { name: 'エーテル', items: ['エーテルの粉', 'エーテルの欠片', 'エーテルの結晶', 'エーテルのエッセンス'], top: 'エーテルのエッセンス' },
  { name: 'アンティキティラ', items: ['アンティキティラ装備の欠片', '壊れたアンティキティラ装置', '摩耗したアンティキティラ装置', '完全なアンティキティラ装置'], top: '完全なアンティキティラ装置' },
  { name: 'ヴォイニッチ', items: ['断片的なヴォイニッチ手稿のコピー', '傷んだヴォイニッチ手稿のコピー', '編集済みのヴォイニッチ手稿のコピー', '完全なヴォイニッチ手稿のコピー'], top: '完全なヴォイニッチ手稿のコピー' },
  { name: '水晶埴輪', items: ['水晶埴輪の破片', '壊れた水晶埴輪', '修復済みの水晶埴輪', '完全な水晶埴輪'], top: '完全な水晶埴輪' },
];

const OOPARTS_TABLE_2 = [
  { name: 'トーテムポール', items: ['トーテムポールの破片', '破損したトーテムポール', '修復済みのトーテムポール', '完全なトーテムポール'], top: '完全なトーテムポール' },
  { name: '古代の電池', items: ['古代の電池の破片', '破損した古代の電池', '摩耗した古代の電池', '完全なる古代の電池'], top: '完全なる古代の電池' },
  { name: '黄金の糸', items: ['黄金の糸', '黄金の巻糸', '大きな黄金の巻糸', '黄金の布'], top: '黄金の布' },
  { name: '髪伸び人形', items: ['髪伸び人形の破片', '破損した髪伸び人形', '修理済みの髪伸び人形', '完全な髪伸び人形'], top: '完全な髪伸び人形' },
  { name: '円盤型のペンダント', items: ['円盤型ペンダントの欠片', '壊れた円盤型ペンダント', '修復途中の円盤型ペンダント', '完全な円盤型ペンダント'], top: '完全な円盤型ペンダント' },
  { name: '古代文明のメダル', items: ['古代文明のメダルの欠片', '破損した古代文明のメダル', '修復途中の古代文明のメダル', '完全な古代文明のメダル'], top: '完全な古代文明のメダル' },
  { name: '中空十二面体', items: ['中空十二面体の欠片', '壊れた中空十二面体', '修復途中の中空十二面体', '完全な中空十二面体'], top: '完全な中空十二面体' },
  { name: 'シャトル', items: ['黄金シャトルの欠片', '壊れた黄金シャトル', '修復途中の黄金シャトル', '完全な黄金シャトル'], top: '完全な黄金シャトル' },
  { name: 'ロケット', items: ['古代ロケットの欠片', '壊れた古代ロケット', '修復途中の古代ロケット', '完全な古代ロケット'], top: '完全な古代ロケット' },
  { name: 'ミステリーストーン', items: ['ミステリーストーンの欠片', '壊れたミステリーストーン', '不完全なミステリーストーン', '完全なミステリーストーン'], top: '完全なミステリーストーン' },
];

const EQUIP_CATEGORIES = ['ネックレス', '時計', 'お守り', 'ヘアピン', 'バッジ', 'バッグ', 'シューズ', 'グローブ', '帽子'];
const EQUIP_LEVELS = ['lv1', 'lv2', 'lv3', 'lv4', 'lv5', 'lv6', 'lv7', 'lv8', 'lv9', 'lv10', '万能'];
const EQUIP_REQ = [1, 40, 45, 50, 55, 65, 65, 60, 50, 60, 1500];

const EQUIP_NAMES: Record<string, string[]> = {
  'ネックレス': ['ブルートゥースのネックレス', '雪花のペンダントの設計図', 'ニコライのロケットペンダントの設計図', '十字架のチョーカーの設計図', 'ドッグタグの設計図', 'パンクチョーカーの設計図', 'チェーンネックレスの設計図', 'グリーンリーフネックレスの設計図', 'オクトパスホルダーの設計図', 'メモリネックレスの設計図', 'ネックレスの万能設計図'],
  '時計': ['デジタルウォッチ', 'レザーの腕時計の設計図', 'ウェーブキャットの時計の設計図', 'アンティークな懐中時計の設計図', '防塵型の腕時計の設計図', 'ゴシック風の腕時計の設計図', 'ストリートファッションウォッチの設計図', 'ローレライの腕時計の設計図', 'ダイバーウォッチの設計図', 'スクリーンウォッチの設計図', '腕時計の万能設計図'],
  'お守り': ['交通安全のお守り', '発熱カイロの設計図', 'ペロロのお守りの設計図', 'クルスの設計図', 'カモフラダルマの設計図', '呪いの人形の設計図', 'ポケット消臭剤の設計図', 'ドリームキャッチャーの設計図', 'サメの歯のお守りの設計図', 'キーキャップトイの設計図', 'お守りの万能設計図'],
  'ヘアピン': ['テニス用ヘアバンド', 'シュシュの設計図', 'モモのヘアピンの設計図', '翼のヘアピンの設計図', '多目的ヘアピンの設計図', 'コウモリのヘアピンの設計図', 'カリグラフィーヘアピンの設計図', 'リーフヘアピンの設計図', 'アンカーヘアピンの設計図', '電磁波カットヘアピンの設計図', 'ヘアピンの万能設計図'],
  'バッジ': ['サーバルのメタルバッジ', 'マナスルのフェルトバッジの設計図', 'アングリーアデリーのバッジの設計図', 'ベロニカの刺繍バッジの設計図', 'カゼヤマのワッペンの設計図', 'ココデビルのバッジの設計図', 'ストリートバッジの設計図', 'ローレライバッジの設計図', 'ハルピュイア・フレキシブルバッジの設計図', 'コインバッジの設計図', 'バッジの万能設計図'],
  'バッグ': ['防水スポーツバッグ', '寒冷地用バッグの設計図', 'ペロロのバッグの設計図', '紺色のスクールバッグの設計図', '戦闘用ランドセルの設計図', 'デビルウイングのトートバッグの設計図', 'ストリートバッグの設計図', '蝶柄のショルダーバッグの設計図', 'スリングドライバッグの設計図', 'メタルケースの設計図', 'バッグの万能設計図'],
  'シューズ': ['ピンクスニーカー', 'ムートンブーツの設計図', 'ピンキーパカのスリッパの設計図', 'アンティークなエナメルローファーの設計図', '戦闘用ブーツの設計図', 'ヒールパンプスの設計図', 'カジュアルスニーカーの設計図', '防水登山ブーツの設計図', 'アクアサンダルの設計図', 'ゲーミングスリッパの設計図', 'シューズの万能設計図'],
  'グローブ': ['スポーツグローブ', 'ニットのミトンの設計図', 'ペロロの鍋掴みの設計図', 'レザーグローブの設計図', 'タクティカルグローブの設計図', 'レースのグローブの設計図', 'アームカバーの設計図', 'パールヤーングローブの設計図', 'セーリンググローブの設計図', 'スーパーグローブの設計図', 'グローブの万能設計図'],
  '帽子': ['無地のキャップ', 'ニット帽の設計図', 'ビッグブラザーの中折れ帽の設計図', 'リボン付きベレー帽の設計図', '防弾ヘルメットの設計図', 'フリルのミニハットの設計図', 'バケットハットの設計図', 'リーフリボン付き中折れ帽の設計図', 'セーラーハットの設計図', 'ゲーミングヘルメットの設計図', '帽子の万能設計図'],
};

const WEAPON_CATEGORIES = [
  { name: 'スプリング', keys: ['錆びたスプリング', '普通のスプリング', 'クロムスプリング', 'チタンスプリング'], top: 'チタンスプリング' },
  { name: 'ハンマー', keys: ['錆びたハンマー', '普通のハンマー', 'クロムハンマー', 'チタンハンマー'], top: 'チタンハンマー' },
  { name: '銃身', keys: ['錆びた銃身', '普通の銃身', 'クロム銃身', 'チタン銃身'], top: 'チタン銃身' },
  { name: '撃針', keys: ['錆びた撃針', '普通の撃針', 'クロム撃針', 'チタン撃針'], top: 'チタン撃針' },
];

const WEAPON_EXP = [15, 75, 300, 1500];
const WEAPON_REQ = 49605;

export const SummaryView: React.FC<SummaryViewProps> = ({ results, masterData }) => {

  const getQty = (name: string) => {
    if (!name) return 0;
    const found = results.find(r => r.name === name);
    return found?.quantity ? Number(found.quantity) : 0;
  };

  const getIcon = (name: string) => {
    const found = masterData.find(d => d.name === name);
    return found?.iconDataUrl || '';
  };

  const formatSchoolName = (name: string) => {
    switch (name) {
      case 'レッドウィンター': return <React.Fragment>レッド<br />ウィンター</React.Fragment>;
      case 'ワイルドハント': return <React.Fragment>ワイルド<br />ハント</React.Fragment>;
      case 'ヴァルキューレ': return <React.Fragment>ヴァル<br />キューレ</React.Fragment>;
      case 'ハイランダー': return <React.Fragment>ハイ<br />ランダー</React.Fragment>;
      default: return name;
    }
  };

  const thStyle: React.CSSProperties = { fontSize: '0.9rem', padding: '6px 12px', color: '#57606f', border: '1px solid var(--border)', fontWeight: 'normal', backgroundColor: '#f8f9fa', whiteSpace: 'nowrap', textAlign: 'center' };
  const thSmallFixedStyle: React.CSSProperties = { ...thStyle, padding: '4px 2px' };
  const rowThStyle: React.CSSProperties = { fontSize: '0.9rem', padding: '8px 12px', fontWeight: 'bold', color: '#2f3542', border: '1px solid var(--border)', backgroundColor: '#f8f9fa', whiteSpace: 'nowrap', textAlign: 'center' };
  const valTdStyle: React.CSSProperties = { padding: '8px 15px', color: '#2f3542', fontSize: '1.0rem', border: '1px solid var(--border)', whiteSpace: 'nowrap', textAlign: 'center' };
  const flexTdStyle: React.CSSProperties = { padding: '0', border: '1px solid var(--border)', whiteSpace: 'nowrap' };

  const flexTdFixedStyle: React.CSSProperties = { ...flexTdStyle, whiteSpace: 'normal', overflow: 'hidden' };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e1e2e6',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'auto',
  };

  const h3Style: React.CSSProperties = {
    fontSize: '1.1rem',
    color: '#2f3542',
    margin: '0 0 15px 0',
    borderLeft: '4px solid #4a69bd',
    paddingLeft: '10px',
  };

  const renderIconHeader = (name: string, title?: string) => {
    const iconUrl = getIcon(name);
    return (
      <th key={title || name} title={title || name} style={thStyle}>
        {iconUrl ? (
          <img src={iconUrl} alt={title || name} style={{ width: '40px', height: '40px', borderRadius: '4px', verticalAlign: 'middle' }} />
        ) : (
          <div style={{ width: '40px', height: '40px', backgroundColor: '#e1e2e6', borderRadius: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
        )}
      </th>
    );
  };

  const renderStackedCell = (qty: number, key: string, reqNum?: number, isFixedTable: boolean = false) => {
    if (reqNum === undefined) {
      return (
        <td key={key} style={valTdStyle}>
          <span>{qty}</span>
        </td>
      );
    }
    const ppl = (qty / reqNum).toFixed(1);
    return (
      <td key={key} style={isFixedTable ? flexTdFixedStyle : flexTdStyle}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '4px 0', borderBottom: '1px dashed var(--border)', textAlign: 'center', color: '#2f3542', fontSize: '1.0rem' }}>
            {qty}
          </div>
          <div style={{ padding: '4px 0', textAlign: 'center', color: '#e55039', fontSize: '1.0rem' }}>
            {ppl}
          </div>
        </div>
      </td>
    );
  };

  const renderEmptyCell = (key: string) => {
    return (
      <td key={key} style={{ ...valTdStyle, color: '#b2bec3' }}>-</td>
    );
  };

  return (
    <div style={{ padding: '5px', display: 'flex', flexWrap: 'wrap', gap: '25px', alignItems: 'flex-start' }}>

      {/* レポート */}
      <div style={cardStyle}>
        <h3 style={h3Style}>レポート</h3>
        <table style={{ borderCollapse: 'collapse', backgroundColor: '#fff' }}>
          <thead>
            <tr>
              <th style={thStyle}></th>
              {renderIconHeader('初級レポート', '初級')}
              {renderIconHeader('中級レポート', '中級')}
              {renderIconHeader('上級レポート', '上級')}
              {renderIconHeader('最上級レポート', '最上級')}
              <th style={thStyle}>合計（人分）</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={rowThStyle}>レポート</td>
              {renderStackedCell(getQty('初級レポート'), '初級レポート')}
              {renderStackedCell(getQty('中級レポート'), '中級レポート')}
              {renderStackedCell(getQty('上級レポート'), '上級レポート')}
              {renderStackedCell(getQty('最上級レポート'), '最上級レポート')}
              <td style={{ ...valTdStyle, color: '#e55039' }}>
                {((getQty('初級レポート') * 50 + getQty('中級レポート') * 500 + getQty('上級レポート') * 2000 + getQty('最上級レポート') * 10000) / 1249185).toFixed(1)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 装備 */}
      <div style={cardStyle}>
        <h3 style={h3Style}>装備</h3>
        <table style={{ borderCollapse: 'collapse', backgroundColor: '#fff' }}>
          <thead>
            <tr>
              <th style={thStyle}></th>
              {EQUIP_CATEGORIES.map(cat => renderIconHeader(EQUIP_NAMES[cat][0], cat))}
            </tr>
          </thead>
          <tbody>
            {EQUIP_LEVELS.map((lv, levelIdx) => (
              <tr key={lv}>
                <td style={rowThStyle}>{lv}</td>
                {EQUIP_CATEGORIES.map(cat => {
                  const itemName = EQUIP_NAMES[cat][levelIdx];
                  const reqNum = EQUIP_REQ[levelIdx];
                  return renderStackedCell(getQty(itemName), itemName, reqNum);
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 武器強化 */}
      <div style={cardStyle}>
        <h3 style={h3Style}>武器強化</h3>
        <table style={{ borderCollapse: 'collapse', backgroundColor: '#fff' }}>
          <thead>
            <tr>
              <th style={thStyle}></th>
              {WEAPON_CATEGORIES.map(cat => renderIconHeader(cat.top, cat.name))}
            </tr>
          </thead>
          <tbody>
            {TIERS.map((tier, tierIdx) => (
              <tr key={tier}>
                <td style={rowThStyle}>{tier}</td>
                {WEAPON_CATEGORIES.map(cat => {
                  const itemName = cat.keys[tierIdx];
                  return (
                    <td key={itemName} style={valTdStyle}>
                      <span>{getQty(itemName)}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td style={rowThStyle}>合計</td>
              {WEAPON_CATEGORIES.map(cat => {
                let totalExp = 0;
                cat.keys.forEach((itemName, idx) => {
                  totalExp += getQty(itemName) * WEAPON_EXP[idx];
                });
                return (
                  <td key={`${cat.name}_合計`} style={{ ...valTdStyle, color: '#e55039' }}>
                    {(totalExp / WEAPON_REQ).toFixed(1)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* BD */}
      <div style={cardStyle}>
        <h3 style={h3Style}>BD</h3>
        <table style={{ borderCollapse: 'collapse', backgroundColor: '#fff', width: '100%', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: '60px' }}></th>
              {SCHOOLS.map(s => (
                <th key={s} style={thSmallFixedStyle}>
                  <div style={{ fontSize: '0.8rem', whiteSpace: 'normal', wordBreak: 'keep-all', lineHeight: '1.2' }}>{formatSchoolName(s)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIERS.map((tier) => {
              const req = tier === '最上級' ? 8 : 30;
              return (
                <tr key={tier}>
                  <td style={rowThStyle}>{tier}</td>
                  {SCHOOLS.map(s => {
                    const itemName = `${tier}戦術教育BD（${s}）`;
                    return renderStackedCell(getQty(itemName), itemName, req, true);
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ノート */}
      <div style={cardStyle}>
        <h3 style={h3Style}>ノート</h3>
        <table style={{ borderCollapse: 'collapse', backgroundColor: '#fff', width: '100%', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: '60px' }}></th>
              {SCHOOLS.map(s => (
                <th key={s} style={thSmallFixedStyle}>
                  <div style={{ fontSize: '0.8rem', whiteSpace: 'normal', wordBreak: 'keep-all', lineHeight: '1.2' }}>{formatSchoolName(s)}</div>
                </th>
              ))}
              <th style={thSmallFixedStyle}>
                <div style={{ fontSize: '0.8rem', whiteSpace: 'normal', wordBreak: 'keep-all', lineHeight: '1.2' }}>秘伝</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {TIERS.map((tier) => {
              const req = tier === '最上級' ? 20 : 25;
              return (
                <tr key={tier}>
                  <td style={rowThStyle}>{tier}</td>
                  {SCHOOLS.map(s => {
                    const itemName = `${tier}技術ノート（${s}）`;
                    return renderStackedCell(getQty(itemName), itemName, req, true);
                  })}
                  {tier === '初級' ? renderStackedCell(getQty('秘伝ノートの破片'), '秘伝ノートの破片', 15, true) :
                    tier === '最上級' ? renderStackedCell(getQty('秘伝ノート'), '秘伝ノート', 1, true) :
                      renderEmptyCell(`秘伝空欄${tier}`)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* オーパーツ 1 */}
      <div style={cardStyle}>
        <h3 style={h3Style}>オーパーツ (1/2)</h3>
        <table style={{ borderCollapse: 'collapse', backgroundColor: '#fff' }}>
          <thead>
            <tr>
              <th style={thStyle}></th>
              {OOPARTS_TABLE_1.map(o => renderIconHeader(o.top, o.name))}
            </tr>
          </thead>
          <tbody>
            {TIERS.map((tier, tierIdx) => (
              <tr key={tier}>
                <td style={rowThStyle}>{tier}</td>
                {OOPARTS_TABLE_1.map(o => {
                  const itemName = o.items[tierIdx];
                  return renderStackedCell(getQty(itemName), itemName);
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* オーパーツ 2 */}
      <div style={cardStyle}>
        <h3 style={h3Style}>オーパーツ (2/2)</h3>
        <table style={{ borderCollapse: 'collapse', backgroundColor: '#fff' }}>
          <thead>
            <tr>
              <th style={thStyle}></th>
              {OOPARTS_TABLE_2.map(o => renderIconHeader(o.top, o.name))}
            </tr>
          </thead>
          <tbody>
            {TIERS.map((tier, tierIdx) => (
              <tr key={tier}>
                <td style={rowThStyle}>{tier}</td>
                {OOPARTS_TABLE_2.map(o => {
                  const itemName = o.items[tierIdx];
                  return renderStackedCell(getQty(itemName), itemName);
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* WB */}
      <div style={cardStyle}>
        <h3 style={h3Style}>WB</h3>
        <table style={{ borderCollapse: 'collapse', backgroundColor: '#fff' }}>
          <thead>
            <tr>
              <th style={thStyle}></th>
              <th style={thStyle}>体育</th>
              <th style={thStyle}>射撃</th>
              <th style={thStyle}>衛生</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={rowThStyle}>WB</td>
              {renderStackedCell(getQty('応用体育WB'), '応用体育WB', 70)}
              {renderStackedCell(getQty('応用射撃WB'), '応用射撃WB', 70)}
              {renderStackedCell(getQty('応用衛生WB'), '応用衛生WB', 70)}
            </tr>
          </tbody>
        </table>
      </div>

      {/* コイン */}
      <div style={cardStyle}>
        <h3 style={h3Style}>コイン</h3>
        <table style={{ borderCollapse: 'collapse', backgroundColor: '#fff' }}>
          <thead>
            <tr>
              <th style={thStyle}></th>
              {['総力戦コイン', '総力戦レアコイン', '戦術コイン', '火力演習コイン', '指名手配コイン', '大決戦コイン', '大決戦レアコイン'].map(n => renderIconHeader(n))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={rowThStyle}>コイン</td>
              {['総力戦コイン', '総力戦レアコイン', '戦術コイン', '火力演習コイン', '指名手配コイン', '大決戦コイン', '大決戦レアコイン'].map(n => renderStackedCell(getQty(n), n))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* その他 */}
      <div style={cardStyle}>
        <h3 style={h3Style}>その他</h3>
        <table style={{ borderCollapse: 'collapse', backgroundColor: '#fff' }}>
          <thead>
            <tr>
              <th style={thStyle}></th>
              <th style={thStyle}>カケラ</th>
              <th style={thStyle}>テイラー</th>
            </tr>
          </thead>
          <tbody>
            {TIERS.map((tier) => (
              <tr key={tier}>
                <td style={rowThStyle}>{tier}</td>
                {tier === '初級' ? renderStackedCell(getQty('神明のカケラ'), '神明のカケラ_tier') : renderEmptyCell(`カケラ空欄${tier}`)}
                {renderStackedCell(getQty(`${tier}テイラーストーン`), `${tier}テイラーストーン`)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
