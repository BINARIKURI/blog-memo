// ============ 状态管理 ============
        let activeTag = 'all';
        let searchQuery = '';

        // ============ 渲染函数 ============
        function getFilteredArticles() {
            return articles.filter(article => {
                const matchesTag = activeTag === 'all' || article.tags.includes(activeTag);
                const matchesSearch = searchQuery === '' ||
                    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    article.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
                return matchesTag && matchesSearch;
            });
        }

        function renderArticles() {
            const container = document.getElementById('articlesContainer');
            const emptyState = document.getElementById('emptyState');
            const filtered = getFilteredArticles();

            if (filtered.length === 0) {
                container.innerHTML = '';
                emptyState.style.display = 'block';
            } else {
                emptyState.style.display = 'none';
                container.innerHTML = filtered.map(article => `
                            <article class="article-card" onclick="openArticle(${article.id})" title="点击阅读全文">
                                <div class="article-icon">${article.icon}</div>
                                <div class="article-body">
                                    <div class="article-meta">
                                        <span class="article-date">📅 ${article.date}</span>
                                        <span>📖 ${Math.floor(Math.random()*800+200)} 字</span>
                                    </div>
                                    <h3>${article.title}</h3>
                                    <p class="article-excerpt">${article.excerpt}</p>
                                    <div class="article-tags">
                                        ${article.tags.map((tag, i) => `
                                            <span class="tag ${article.tagClasses[i] || 'tag-pink'}" 
                                                  onclick="event.stopPropagation(); filterByTag('${tag}')"
                                                  title="筛选「${tag}」相关笔记">#${tag}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            </article>
                        `).join('');
            }

            updateTagCloudActive();
            updateRecentList();
            updateNavActive();
        }

        function updateTagCloudActive() {
            const allTags = document.querySelectorAll('#tagCloud .tag');
            allTags.forEach(tagEl => {
                const tagText = tagEl.textContent.replace('🔄 ', '').trim();
                if (tagText === activeTag || (activeTag === 'all' && tagText === '全部')) {
                    tagEl.classList.add('active-tag');
                } else {
                    tagEl.classList.remove('active-tag');
                }
            });
        }

        function updateRecentList() {
            const recentList = document.getElementById('recentList');
            const recentArticles = articles.slice(0, 5);
            recentList.innerHTML = recentArticles.map(a => `
                        <li onclick="openArticle(${a.id})" title="点击阅读">${a.title}</li>
                    `).join('');
        }

        function updateNavActive() {
            const navLinks = document.querySelectorAll('.nav-links a');
            navLinks.forEach(link => {
                link.classList.remove('active');
                const linkText = link.textContent.trim();
                const filterTag = link.getAttribute('onclick')?.match(/filterByTag\('(.+?)'\)/)?.[1];
                if (filterTag === activeTag || (activeTag === 'all' && filterTag === 'all')) {
                    link.classList.add('active');
                }
            });
            // 首页链接
            const homeLink = document.querySelector('.nav-links a[href="#home"]');
            if (homeLink && activeTag === 'all' && searchQuery === '') {
                homeLink.classList.add('active');
            }
        }

        // ============ 筛选与搜索 ============
        function filterByTag(tag) {
            if (tag === '全部') tag = 'all';
            activeTag = tag;
            searchQuery = '';
            document.getElementById('searchInput').value = '';
            document.getElementById('searchClear').classList.remove('visible');
            renderArticles();
            document.getElementById('articlesContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });
            showToast(`🔖 筛选：${tag === 'all' ? '全部笔记' : '#' + tag}`);
        }

        function handleSearch() {
            const input = document.getElementById('searchInput');
            const clearBtn = document.getElementById('searchClear');
            searchQuery = input.value.trim();
            if (searchQuery) {
                clearBtn.classList.add('visible');
                activeTag = 'all';
            } else {
                clearBtn.classList.remove('visible');
            }
            renderArticles();
        }

        function clearSearch() {
            document.getElementById('searchInput').value = '';
            searchQuery = '';
            document.getElementById('searchClear').classList.remove('visible');
            renderArticles();
            document.getElementById('searchInput').focus();
        }

        // ============ 模态框 ============
        function openArticle(id) {
            const article = articles.find(a => a.id === id);
            if (!article) return;

            document.getElementById('modalIcon').textContent = article.icon;
            document.getElementById('modalTitle').textContent = article.title;
            document.getElementById('modalMeta').innerHTML = `
                        <span>📅 ${article.date}</span>
                        <span>📝 约${Math.floor(Math.random()*500+300)}字</span>
                    `;
            document.getElementById('modalBody').innerHTML = article.content;
            document.getElementById('modalTags').innerHTML = article.tags.map((tag, i) => `
                        <span class="tag ${article.tagClasses[i] || 'tag-pink'}" 
                              onclick="event.stopPropagation(); closeModal(); filterByTag('${tag}')"
                              style="cursor:pointer;">#${tag}</span>
                    `).join('');

            document.getElementById('modalOverlay').classList.add('open');
            document.body.style.overflow = 'hidden';
            document.getElementById('modalCard').scrollTop = 0;
        }

        function closeModal() {
            document.getElementById('modalOverlay').classList.remove('open');
            document.body.style.overflow = '';
        }

        function closeModalOutside(event) {
            if (event.target === document.getElementById('modalOverlay')) {
                closeModal();
            }
        }

        // ESC 关闭
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });

        // ============ Toast ============
        let toastTimer;

        function showToast(message) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.classList.add('show');
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => {
                toast.classList.remove('show');
            }, 2200);
        }

        // ============ 回到顶部 ============
        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        const backToTopBtn = document.getElementById('backToTop');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }

            // 导航栏阴影
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 30) {
                navbar.style.boxShadow = '0 8px 30px rgba(255,158,181,0.2)';
            } else {
                navbar.style.boxShadow = '0 2px 12px rgba(255,158,181,0.1)';
            }
        });

        // ============ 汉堡菜单 ============
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('navLinks');

        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('open');
        });

        function closeMenu() {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
        }

        // 点击页面其他区域关闭菜单
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar') && navLinks.classList.contains('open')) {
                closeMenu();
            }
        });

        function navigateTo(section) {
            document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
            activeTag = 'all';
            searchQuery = '';
            document.getElementById('searchInput').value = '';
            document.getElementById('searchClear').classList.remove('visible');
            renderArticles();
        }

        // ============ 樱花动画 ============
        const sakuraCanvas = document.getElementById('sakura-canvas');
        const ctx = sakuraCanvas.getContext('2d');
        let sakuraParticles = [];
        const maxParticles = 55;

        function resizeCanvas() {
            sakuraCanvas.width = window.innerWidth;
            sakuraCanvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class SakuraPetal {
            constructor() {
                this.reset(true);
            }
            reset(initial = false) {
                this.x = Math.random() * sakuraCanvas.width;
                this.y = initial ? Math.random() * sakuraCanvas.height : -40 - Math.random() * 200;
                this.size = 4 + Math.random() * 10;
                this.speedY = 0.6 + Math.random() * 2.2;
                this.speedX = -0.4 + Math.random() * 0.8;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.03;
                this.opacity = 0.35 + Math.random() * 0.5;
                this.color = Math.random() < 0.6 ?
                    `rgba(255,${180 + Math.random()*60},${190 + Math.random()*50},` :
                    `rgba(255,${210 + Math.random()*45},${210 + Math.random()*40},`;
            }
            update() {
                this.y += this.speedY;
                this.x += this.speedX + Math.sin(this.y * 0.015) * 0.5;
                this.rotation += this.rotationSpeed;
                if (this.y > sakuraCanvas.height + 50 || this.x < -60 || this.x > sakuraCanvas.width + 60) {
                    this.reset();
                }
            }
            draw(ctx) {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = this.color + `${this.opacity})`;
                ctx.beginPath();
                // 画花瓣形状
                const s = this.size;
                ctx.moveTo(0, -s * 0.6);
                ctx.bezierCurveTo(s * 0.5, -s * 0.6, s * 0.8, -s * 0.1, s * 0.35, s * 0.5);
                ctx.bezierCurveTo(s * 0.2, s * 0.2, -s * 0.2, s * 0.2, -s * 0.35, s * 0.5);
                ctx.bezierCurveTo(-s * 0.8, -s * 0.1, -s * 0.5, -s * 0.6, 0, -s * 0.6);
                ctx.fill();
                ctx.restore();
            }
        }

        function initSakura() {
            sakuraParticles = [];
            for (let i = 0; i < maxParticles; i++) {
                sakuraParticles.push(new SakuraPetal());
            }
        }
        initSakura();

        function animateSakura() {
            ctx.clearRect(0, 0, sakuraCanvas.width, sakuraCanvas.height);
            sakuraParticles.forEach(p => {
                p.update();
                p.draw(ctx);
            });
            requestAnimationFrame(animateSakura);
        }
        animateSakura();

        // 窗口大小变化时重新初始化
        window.addEventListener('resize', () => {
            resizeCanvas();
            initSakura();
        });

        // ============ 初始化 ============
        function init() {
            renderArticles();
            updateRecentList();
        }
        init();

        // ============ 键盘快捷键 ============
        document.addEventListener('keydown', function(e) {
            // Ctrl+K 或 / 聚焦搜索
            if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !e.ctrlKey && document.activeElement === document
                    .body)) {
                e.preventDefault();
                document.getElementById('searchInput').focus();
                document.getElementById('searchInput').scrollIntoView({ behavior: 'smooth' });
            }
        });

        console.log('🌸 梦の记事本 - 二次元个人博客已就绪！');
        console.log('💡 提示：按 / 或 Ctrl+K 快速搜索');
        console.log('📝 共加载 ' + articles.length + ' 篇笔记');