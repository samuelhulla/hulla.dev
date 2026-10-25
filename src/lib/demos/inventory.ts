export type Product = { id: number; name: string; stock: number }
export type InventoryCommand =
  | { kind: 'rename'; id: number; name: string }
  | { kind: 'stock'; id: number; stock: number }
  | { kind: 'buy'; id: number }

export const initialInventory = (): Product[] => [
  { id: 1, name: 'Studio headphones', stock: 5 },
  { id: 2, name: 'USB-C hub', stock: 2 },
  { id: 3, name: 'Desk microphone', stock: 0 },
]

export function commitInventory(
  products: readonly Product[],
  command: InventoryCommand
): { products: Product[]; description: string; error?: string } {
  const product = products.find((item) => item.id === command.id)
  const unchanged = products.map((item) => ({ ...item }))
  if (!product)
    return { products: unchanged, description: '', error: 'Product not found.' }
  if (
    command.kind === 'rename' &&
    (!command.name.trim() || command.name.length > 60)
  )
    return {
      products: unchanged,
      description: '',
      error: 'Use a product name from 1 to 60 characters.',
    }
  if (
    command.kind === 'stock' &&
    (!Number.isInteger(command.stock) ||
      command.stock < 0 ||
      command.stock > 10000)
  )
    return {
      products: unchanged,
      description: '',
      error: 'Stock must be a whole number from 0 to 10,000.',
    }
  if (command.kind === 'buy' && product.stock < 1)
    return {
      products: unchanged,
      description: '',
      error: `${product.name} is sold out.`,
    }
  const next = {
    ...product,
    ...(command.kind === 'rename'
      ? { name: command.name }
      : { stock: command.kind === 'buy' ? product.stock - 1 : command.stock }),
  }
  return {
    products: products.map((item) =>
      item.id === command.id ? next : { ...item }
    ),
    description:
      command.kind === 'rename'
        ? `Renamed product #${product.id} to ${next.name}`
        : `${next.name}: stock ${product.stock} → ${next.stock}`,
  }
}
