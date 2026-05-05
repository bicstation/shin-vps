export default function ProductSpec({ product }: any) {
  return (
    <section className="grid md:grid-cols-2 gap-6 px-4">

      <img
        src={product.image_url || '/no-image.png'}
        className="w-full h-[300px] object-contain"
      />

      <div>
        <h2 className="font-bold">{product.name}</h2>

        <div className="text-sm mt-2 space-y-1 text-gray-300">
          <p>CPU: {product.cpu_model}</p>
          <p>GPU: {product.gpu_model}</p>
          <p>メモリ: {product.memory}</p>
          <p>ストレージ: {product.storage}</p>
        </div>
      </div>

    </section>
  )
}