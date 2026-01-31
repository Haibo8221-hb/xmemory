import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CATEGORIES } from '@/types/database'
import { ArrowRight, Upload, ShoppingCart, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            <span className="text-blue-600">AI记忆</span>交易市场
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            把你调教AI的心血变现。分享你的ChatGPT Memory，<br />
            让别人跳过冷启动，直接获得专业化的AI助手。
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/explore">
              <Button size="lg">
                浏览市场 <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/upload">
              <Button size="lg" variant="outline">
                上传Memory
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">如何运作</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. 导出 & 上传</h3>
                <p className="text-gray-500">
                  从ChatGPT导出你的Memory文件，上传到平台并设置价格
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. 浏览 & 购买</h3>
                <p className="text-gray-500">
                  找到你需要的领域，购买别人精心调教的Memory
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. 导入 & 使用</h3>
                <p className="text-gray-500">
                  将Memory导入到你的AI，立即获得专业化的助手体验
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">热门分类</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.slice(0, 5).map(category => (
              <Link
                key={category.value}
                href={`/explore?category=${category.value}`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6 text-center">
                    <span className="text-4xl mb-3 block">{category.emoji}</span>
                    <span className="font-medium">{category.label}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/explore">
              <Button variant="outline">
                查看全部分类 <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">准备好分享你的AI了吗？</h2>
          <p className="text-gray-600 mb-8">
            把你花在调教AI上的时间变成收入
          </p>
          <Link href="/auth/register">
            <Button size="lg">
              立即开始 <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
