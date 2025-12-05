import Header from './Header';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-background text-white">
            <Header />
            <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-6">
                {children}
            </main>
        </div>
    );
}
