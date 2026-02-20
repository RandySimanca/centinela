import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError('Error al iniciar sesión. Verifica tus credenciales.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                        Sistema Electoral
                    </h2>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                        Centinela
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Inicia sesión para acceder al panel de control
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <Input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            label="Correo Electrónico"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            label="Contraseña"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={loading}
                        >
                            Ingresar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
