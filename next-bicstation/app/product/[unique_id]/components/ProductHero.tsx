export default function ProductHero({ product }: any) {
  return (
    <section className="text-center py-8">

      <h1 className="text-xl font-bold text-yellow-400">
        この価格帯ならこれでOK
      </h1>

      <div className="text-4xl font-extrabold text-orange-400 mt-2">
        ¥{product.price?.toLocaleString()}
      </div>

      <a
        href="#buy"
        className="block w-full max-w-md mx-auto mt-4 bg-orange-500 py-4 rounded-xl font-bold"
      >
        👉 今すぐこの価格で購入する
      </a>

    </section>
  )
}