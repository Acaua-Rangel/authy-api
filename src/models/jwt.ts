import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET;

// Payload padrão (pode ser qualquer objeto)
interface Payload {
  userId: number;
}

// Função para gerar token
export function generateToken(payload: Payload): string {
  const token = jwt.sign(payload, secretKey, {
    expiresIn: '2m', // tempo de expiração do token
  });

  return token;
}