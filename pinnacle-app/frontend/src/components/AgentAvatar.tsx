// Agent avatar badge for the dbt-wizard live-build playback.
// Ported from Healthcare-EPIC-Snowflake-Demo — Pinnacle Motors automotive flavour.

import type { WizardAgent, AgentId } from './wizardTypes';

interface Props {
  agent?: WizardAgent;
  systemColor?: string;
  active?: boolean;
  size?: number;
  from?: AgentId;
}

export default function AgentAvatar({ agent, systemColor = '#dc2626', active = false, size = 40, from }: Props) {
  const color = agent?.color ?? systemColor;
  const code = agent?.code ?? (from === 'system' ? 'SYS' : '??');

  return (
    <span
      className="wizard-agent-avatar"
      data-active={active ? 'true' : undefined}
      style={{
        color,
        height: size,
        width: size,
        minWidth: size,
        fontSize: Math.max(11, size * 0.36),
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 0,
        background: 'rgba(15,15,18,0.55)',
        border: `1.5px solid ${active ? color : 'rgba(15,15,18,0.8)'}`,
        fontFamily: '"JetBrains Mono", monospace',
        fontWeight: 700,
        letterSpacing: '0.05em',
        transition: 'all 200ms ease',
        boxShadow: active ? `0 0 0 2px ${color}, 0 0 14px ${color}66` : undefined,
        flexShrink: 0,
      }}
      title={agent?.name ?? 'System'}
    >
      {code}
    </span>
  );
}
