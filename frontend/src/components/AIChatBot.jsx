import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const AIChatBot = () => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { role: 'bot', text: "Welcome to StyleHub! Looking for something specific?" }
    ]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            // Adjust the URL to your actual backend port (usually 5000 or 8080)
            const { data } = await axios.post('http://localhost:4000/api/chat/ai-search', { 
                message: input 
            });

            const botMsg = { 
                role: 'bot', 
                text: data.reply, 
                products: data.products 
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            setMessages(prev => [...prev, { 
                role: 'bot', 
                text: "My connection to the store is a bit weak. Check the console for details!" 
            }]);
            console.error("Chat Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>✨ StyleHub AI Assistant</div>
            
            <div style={styles.chatWindow}>
                {messages.map((m, i) => (
                    <div key={i} style={{ ...styles.msgRow, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{ ...styles.bubble, backgroundColor: m.role === 'user' ? '#333' : '#f1f1f1', color: m.role === 'user' ? '#fff' : '#000' }}>
                            {m.text}
                        </div>
                        
                        {/* Render Products if they exist in the bot response */}
                        {m.products && m.products.length > 0 && (
                            <div style={styles.productList}>
                                {m.products.map(p => (
                                    <div key={p._id} style={styles.card}>
                                        <img src={p.image} alt={p.name} style={styles.cardImg} />
                                        <div style={styles.cardTitle}>{p.name}</div>
                                        <div style={styles.cardPrice}>${p.price}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {loading && <div style={styles.loader}>Assistant is typing...</div>}
                <div ref={chatEndRef} />
            </div>

            <div style={styles.inputArea}>
                <input 
                    style={styles.input}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about shoes, jackets..."
                />
                <button onClick={handleSend} style={styles.btn}>Send</button>
            </div>
        </div>
    );
};

// Simple inline styles for a clean look
const styles = {
    container: { position: 'fixed', bottom: '20px', right: '20px', width: '350px', height: '500px', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', zIndex: 1000, border: '1px solid #eee', overflow: 'hidden', fontFamily: 'sans-serif' },
    header: { padding: '15px', backgroundColor: '#333', color: '#fff', fontWeight: 'bold', textAlign: 'center' },
    chatWindow: { flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' },
    msgRow: { display: 'flex', flexDirection: 'column', maxWidth: '85%' },
    bubble: { padding: '10px 15px', borderRadius: '15px', fontSize: '14px', lineHeight: '1.4' },
    productList: { display: 'flex', gap: '10px', marginTop: '10px', overflowX: 'auto', paddingBottom: '10px', width: '300px' },
    card: { minWidth: '120px', border: '1px solid #ddd', borderRadius: '8px', padding: '5px', textAlign: 'center', backgroundColor: '#fff' },
    cardImg: { width: '100%', height: '80px', objectFit: 'cover', borderRadius: '5px' },
    cardTitle: { fontSize: '11px', margin: '5px 0', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    cardPrice: { fontSize: '12px', color: '#666' },
    inputArea: { display: 'flex', padding: '10px', borderTop: '1px solid #eee' },
    input: { flex: 1, border: 'none', outline: 'none', padding: '5px' },
    btn: { backgroundColor: '#333', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' },
    loader: { fontSize: '12px', color: '#999', fontStyle: 'italic' }
};

export default AIChatBot;