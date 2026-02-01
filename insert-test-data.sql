-- Get the test user ID
-- User: test@xmemory.work -> 029acc16-b3d9-4d2a-95b1-8f9bbbff181e

-- Insert test memories
INSERT INTO memories (seller_id, title, description, category, tags, price, platform, status, preview_content, file_path) VALUES
-- 免费 Memory
('029acc16-b3d9-4d2a-95b1-8f9bbbff181e', '资深React开发助手', '经过6个月调教的React开发Memory，熟悉React 18、Hooks、状态管理等最佳实践。适合想快速提升React开发效率的开发者。', 'programming', ARRAY['React', 'TypeScript', 'Hooks', '前端'], 0, 'chatgpt', 'active', '这个Memory包含：\n- React 18新特性使用经验\n- 自定义Hooks最佳实践\n- 性能优化技巧\n- 状态管理方案对比', 'test/react-dev.json'),

('029acc16-b3d9-4d2a-95b1-8f9bbbff181e', 'Python数据分析专家', '专注数据分析和可视化，熟练使用Pandas、NumPy、Matplotlib。3个月实战调教，适合数据分析入门者。', 'programming', ARRAY['Python', 'Pandas', '数据分析', '可视化'], 0, 'chatgpt', 'active', '包含内容：\n- Pandas数据处理技巧\n- 数据清洗常见问题\n- 可视化图表选择指南\n- 真实案例分析经验', 'test/python-data.json'),

('029acc16-b3d9-4d2a-95b1-8f9bbbff181e', '小红书爆款文案助手', '专门针对小红书平台优化的文案写作Memory，掌握爆款标题、封面文案、正文结构。已帮助创作50+篇笔记。', 'writing', ARRAY['小红书', '文案', '营销', '爆款'], 0, 'chatgpt', 'active', '特色功能：\n- 爆款标题公式\n- 封面文案模板\n- 正文结构优化\n- 热门话题追踪', 'test/xiaohongshu.json'),

-- 付费 Memory
('029acc16-b3d9-4d2a-95b1-8f9bbbff181e', 'Next.js全栈开发专家', '深度调教的Next.js 14全栈开发Memory，涵盖App Router、Server Actions、数据库集成、部署优化。8个月实战经验沉淀。', 'programming', ARRAY['Next.js', 'React', '全栈', 'TypeScript'], 4.99, 'chatgpt', 'active', '核心能力：\n- App Router架构设计\n- Server Components最佳实践\n- 数据库ORM选择\n- Vercel/自托管部署\n- 性能优化策略', 'test/nextjs-fullstack.json'),

('029acc16-b3d9-4d2a-95b1-8f9bbbff181e', 'Claude提示词工程师', '专门为Claude优化的提示词工程Memory，掌握结构化提示、思维链、角色扮演等高级技巧。让Claude输出质量翻倍。', 'programming', ARRAY['Claude', '提示词', 'AI', 'Prompt'], 2.99, 'claude', 'active', '包含技巧：\n- 结构化提示模板\n- 思维链引导方法\n- 角色定义最佳实践\n- 输出格式控制\n- 复杂任务拆解', 'test/claude-prompt.json'),

('029acc16-b3d9-4d2a-95b1-8f9bbbff181e', '英语学术写作导师', '学术论文写作专用Memory，熟悉APA/MLA格式、学术表达、逻辑结构。帮助非母语者写出地道学术英语。', 'learning', ARRAY['英语', '学术写作', '论文', '留学'], 3.99, 'chatgpt', 'active', '辅导范围：\n- 论文结构规划\n- 学术词汇使用\n- 引用格式规范\n- 语法润色建议\n- 逻辑连贯性优化', 'test/academic-writing.json'),

('029acc16-b3d9-4d2a-95b1-8f9bbbff181e', 'UI/UX设计顾问', '专业UI/UX设计Memory，精通Figma工作流、设计系统、用户研究方法。帮你做出专业级界面设计。', 'design', ARRAY['UI', 'UX', 'Figma', '设计系统'], 5.99, 'chatgpt', 'active', '设计能力：\n- 设计系统搭建\n- 组件库规范\n- 用户流程优化\n- 可访问性设计\n- 设计交付规范', 'test/ui-ux.json'),

('029acc16-b3d9-4d2a-95b1-8f9bbbff181e', '创业融资顾问', '连续创业者调教的商业Memory，熟悉BP撰写、投资人沟通、估值谈判。已协助完成3轮融资。', 'business', ARRAY['创业', '融资', 'BP', '投资'], 9.99, 'chatgpt', 'active', '核心能力：\n- 商业计划书结构\n- 财务模型搭建\n- 投资人pitch技巧\n- 估值方法论\n- 条款清单解读', 'test/startup-funding.json');

-- Update seller profile
INSERT INTO profiles (id, username, bio, avatar_url) 
VALUES ('029acc16-b3d9-4d2a-95b1-8f9bbbff181e', 'xmemory官方', '平台官方账号，提供高质量示例Memory', null)
ON CONFLICT (id) DO UPDATE SET username = 'xmemory官方', bio = '平台官方账号，提供高质量示例Memory';
