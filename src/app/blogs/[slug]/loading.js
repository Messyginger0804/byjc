export default function Loading() {
    return (
        <div className="w-full min-h-[70vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent dark:border-accentDark"></div>
        </div>
    );
}