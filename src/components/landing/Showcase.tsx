export function Showcase() {
  return (
    <section className="py-24 bg-white dark:bg-dark-surface relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Un tableau de bord intuitif</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Une vue d'ensemble complète sur vos stocks, vos alertes et vos performances en un seul endroit.</p>
        </div>
        <div className="max-w-5xl mx-auto relative z-10 floating-image-alt">
          <div className="glass-card rounded-2xl p-2 md:p-4 shadow-2xl relative bg-gray-50 dark:bg-gray-900">
            <img 
              alt="Dashboard Mockup" 
              className="w-full h-auto rounded-xl object-cover shadow-inner border border-gray-200 dark:border-gray-800" 
              src="/dashboard-mockup-responsive.png" 
              style={{ maxHeight: '600px' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
