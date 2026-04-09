
export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) {
  return (
    <div style={{ 
      padding: '60px 20px', 
      textAlign: 'center', 
      background: 'rgba(255, 255, 255, 0.02)', 
      borderRadius: 'var(--radius-lg)',
      border: '1px dashed var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px'
    }}>
      <div style={{ 
        width: '48px', 
        height: '48px', 
        borderRadius: '50%', 
        background: 'rgba(0, 212, 255, 0.1)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: '4px'
      }}>
        <Icon size={24} style={{ color: 'var(--color-accent)' }} />
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{title}</h3>
      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0, maxWidth: '300px', lineHeight: 1.5 }}>
        {description}
      </p>
      {actionLabel && (
        <button 
          className="btn btn-primary btn-sm" 
          onClick={onAction}
          style={{ marginTop: '8px' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
