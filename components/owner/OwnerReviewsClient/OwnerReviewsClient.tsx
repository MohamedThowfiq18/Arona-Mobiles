'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { showToast } from '@/components/customer/Toast/Toast';
import styles from './OwnerReviewsClient.module.css';

interface Review {
  id: string; product_id: string; rating: number; title?: string; comment: string;
  is_published: boolean; created_at: string; verified_purchase: boolean;
  products?: { brand: string; model: string };
}

interface QA {
  id: string; product_id: string; question: string; answer?: string;
  is_published: boolean; created_at: string;
  products?: { brand: string; model: string };
}

export default function OwnerReviewsClient({ reviews: initReviews, qa: initQA }: { reviews: Review[]; qa: QA[] }) {
  const [reviews, setReviews] = useState(initReviews);
  const [qa, setQA] = useState(initQA);
  const [tab, setTab] = useState<'reviews' | 'qa'>('reviews');
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');

  const togglePublish = async (table: 'reviews' | 'product_qa', id: string, current: boolean) => {
    const supabase = getSupabaseClient();
    await supabase.from(table).update({ is_published: !current }).eq('id', id);
    if (table === 'reviews') {
      setReviews(prev => prev.map(r => r.id === id ? { ...r, is_published: !current } : r));
    } else {
      setQA(prev => prev.map(q => q.id === id ? { ...q, is_published: !current } : q));
    }
    showToast({ type: 'success', title: `${!current ? 'Published' : 'Unpublished'}` });
  };

  const submitAnswer = async (qaId: string) => {
    if (!answerText.trim()) return;
    const supabase = getSupabaseClient();
    await supabase.from('product_qa').update({ answer: answerText, is_published: true }).eq('id', qaId);
    setQA(prev => prev.map(q => q.id === qaId ? { ...q, answer: answerText, is_published: true } : q));
    setAnsweringId(null);
    setAnswerText('');
    showToast({ type: 'success', title: 'Answer published!' });
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    const supabase = getSupabaseClient();
    await supabase.from('reviews').delete().eq('id', id);
    setReviews(prev => prev.filter(r => r.id !== id));
    showToast({ type: 'success', title: 'Review deleted' });
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>⭐ Reviews & Q&A</h1>

      <div className={styles.tabBar}>
        <button className={`${styles.tab} ${tab === 'reviews' ? styles.tabActive : ''}`} onClick={() => setTab('reviews')}>
          Reviews ({reviews.length})
        </button>
        <button className={`${styles.tab} ${tab === 'qa' ? styles.tabActive : ''}`} onClick={() => setTab('qa')}>
          Q&A ({qa.length})
        </button>
      </div>

      {/* Reviews tab */}
      {tab === 'reviews' && (
        <div className={styles.list}>
          {reviews.length === 0 && <div className={styles.empty}>No reviews yet.</div>}
          {reviews.map(r => (
            <div key={r.id} className={`${styles.card} ${!r.is_published ? styles.cardUnpublished : ''}`}>
              <div className={styles.cardTop}>
                <div>
                  <div className={styles.product}>{r.products?.brand} {r.products?.model}</div>
                  <div className={styles.rating}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)} · {r.rating}/5</div>
                  {r.title && <div className={styles.reviewTitle}>{r.title}</div>}
                  <div className={styles.comment}>{r.comment}</div>
                  <div className={styles.meta}>
                    {new Date(r.created_at).toLocaleDateString('en-IN')}
                    {r.verified_purchase && ' · ✅ Verified Purchase'}
                  </div>
                </div>
                <div className={styles.actions}>
                  <button
                    className={`btn btn--sm ${r.is_published ? 'btn--ghost' : 'btn--primary'}`}
                    onClick={() => togglePublish('reviews', r.id, r.is_published)}
                  >
                    {r.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button className="btn btn--ghost btn--sm" style={{ color: 'var(--color-danger)' }}
                    onClick={() => deleteReview(r.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Q&A tab */}
      {tab === 'qa' && (
        <div className={styles.list}>
          {qa.length === 0 && <div className={styles.empty}>No questions yet.</div>}
          {qa.map(q => (
            <div key={q.id} className={`${styles.card} ${!q.is_published ? styles.cardUnpublished : ''}`}>
              <div className={styles.cardTop}>
                <div style={{ flex: 1 }}>
                  <div className={styles.product}>{q.products?.brand} {q.products?.model}</div>
                  <div className={styles.question}>❓ {q.question}</div>
                  {q.answer ? (
                    <div className={styles.answer}>💬 {q.answer}</div>
                  ) : (
                    answeringId === q.id ? (
                      <div className={styles.answerForm}>
                        <textarea className="form-input" rows={2} value={answerText}
                          onChange={e => setAnswerText(e.target.value)} placeholder="Type your answer..." autoFocus />
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button className="btn btn--primary btn--sm" onClick={() => submitAnswer(q.id)}>Publish Answer</button>
                          <button className="btn btn--ghost btn--sm" onClick={() => setAnsweringId(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.noAnswer}>No answer yet</div>
                    )
                  )}
                  <div className={styles.meta}>{new Date(q.created_at).toLocaleDateString('en-IN')}</div>
                </div>
                <div className={styles.actions}>
                  {!q.answer && answeringId !== q.id && (
                    <button className="btn btn--primary btn--sm" onClick={() => { setAnsweringId(q.id); setAnswerText(''); }}>
                      Answer
                    </button>
                  )}
                  <button className={`btn btn--sm ${q.is_published ? 'btn--ghost' : 'btn--secondary'}`}
                    onClick={() => togglePublish('product_qa', q.id, q.is_published)}>
                    {q.is_published ? 'Hide' : 'Publish'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
