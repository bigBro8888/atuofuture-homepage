function getRootPrefix() {
  const depth = Number(document.body.dataset.navDepth || 0)
  if (depth <= 0) return './'
  return '../'.repeat(depth)
}

function iconMail() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z"/></svg>`
}

function iconPhone() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8Z"/></svg>`
}

export function renderSiteFooter() {
  const root = getRootPrefix()
  return `
    <footer class="site-footer" id="site-footer">
      <div class="max-w-max-width mx-auto px-margin-desktop">
        <div class="site-footer__main">
          <div class="site-footer__brand">
            <a href="${root}" class="site-footer__logo" aria-label="安托未来首页">
              <img src="${root}assets/artink-logo-light.png" alt="安托未来" />
            </a>
            <div class="site-footer__social">
              <a href="mailto:contact@atuofuture.com" aria-label="邮箱">${iconMail()}</a>
              <a href="tel:4008889999" aria-label="电话">${iconPhone()}</a>
            </div>
          </div>
          <div class="site-footer__col">
            <h6>关于安托未来</h6>
            <ul>
              <li><a href="${root}about/">关于我们</a></li>
              <li><a href="${root}news/">新闻中心</a></li>
              <li><a href="${root}about/">联系我们</a></li>
            </ul>
          </div>
          <div class="site-footer__col">
            <h6>产品与方案</h6>
            <ul>
              <li><a href="${root}solutions/">行业解决方案</a></li>
              <li><a href="${root}agents/">智能体</a></li>
              <li><a href="${root}hardware/">智能硬件</a></li>
              <li><a href="https://token.atuofuture.com" target="_blank" rel="noopener noreferrer" data-token-link>AI Token</a></li>
            </ul>
          </div>
          <div class="site-footer__col">
            <h6>行业</h6>
            <ul>
              <li><a href="${root}solutions/?id=building">智慧楼宇</a></li>
              <li><a href="${root}solutions/?id=campus">园区运营</a></li>
              <li><a href="${root}solutions/?id=commercial">商业资产</a></li>
              <li><a href="${root}solutions/?id=energy">能源能耗</a></li>
            </ul>
          </div>
          <div class="site-footer__col">
            <h6>与我们联系</h6>
            <ul>
              <li><a href="#" data-demo-modal-open>预约方案演示</a></li>
              <li><a href="mailto:contact@atuofuture.com">contact@atuofuture.com</a></li>
              <li><a href="tel:4008889999">400-888-9999</a></li>
            </ul>
          </div>
        </div>
        <div class="site-footer__bottom">
          <p>© 2026 atuofuture</p>
          <nav class="site-footer__legal" aria-label="法律信息">
            <a href="${root}about/">企业信息</a>
            <a href="${root}about/">隐私声明</a>
            <a href="${root}about/">使用条款</a>
            <a href="${root}about/">联系我们</a>
          </nav>
        </div>
      </div>
    </footer>
  `
}

export function initSiteFooter() {
  const mount = document.getElementById('site-footer') || document.querySelector('footer.site-footer')
  if (!mount) return
  mount.outerHTML = renderSiteFooter()
}
