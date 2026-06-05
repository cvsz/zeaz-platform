// ZeaZDev [Frontend Screen Dashboard] //
// Project: Auto Bot Trader i18n //
// Version: 1.0.0 (Omega Scaffolding) //
// Author: ZeaZDev Meta-Intelligence (Generated) //
// --- DO NOT EDIT HEADER --- //
"use client";

import React, { useEffect, useState } from 'react';
import { initI18n } from '../../i18n/client';
import { useTranslation } from 'react-i18next';

interface PnlResponse {
  total_pnl: number;
  currency: string;
  open_bots: number;
  last_update: string;
}

export default function DashboardPage({ params }: { params: { lng: string } }) {
  initI18n(params.lng);
  const { t } = useTranslation('translation');
  const [pnl, setPnl] = useState<PnlResponse | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/dashboard/pnl`)
      .then(r => r.json())
      .then(setPnl)
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>{t('dashboard.title')}</h1>
      <section>
        <strong>{t('dashboard.pnl')}:</strong>{" "}
        {pnl ? `${pnl.total_pnl} ${pnl.currency}` : 'Loading...'}
      </section>
      <section>
        <div>{t('strategies.list')}:</div>
        <Strategies locale={params.lng} />
      </section>
      <section>
        <BotControl locale={params.lng} />
      </section>
    </div>
  );
}

function Strategies({ locale }: { locale: string }) {
  const { t } = useTranslation('translation');
  const [strategies, setStrategies] = useState<string[]>([]);
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/strategies`)
      .then(r => r.json())
      .then(d => setStrategies(d.strategies))
      .catch(console.error);
  }, []);
  return (
    <ul>
      {strategies.map(s => <li key={s}>{s}</li>)}
      {strategies.length === 0 && <li>...</li>}
    </ul>
  );
}

function BotControl({ locale }: { locale: string }) {
  const { t } = useTranslation('translation');
  const [botId, setBotId] = useState<string | null>(null);

  const startBot = () => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/bot/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy: 'RSI_CROSS', symbol: 'BTC/USDT', timeframe: '1m' })
    }).then(r => r.json()).then(d => setBotId(d.bot_id));
  };

  const stopBot = () => {
    if (!botId) return;
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/bot/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot_id: botId })
    }).then(() => setBotId(null));
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      {!botId && <button onClick={startBot}>{t('bot.start')}</button>}
      {botId && <button onClick={stopBot}>{t('bot.stop')}</button>}
    </div>
  );
}