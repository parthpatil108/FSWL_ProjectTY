import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function CreateHabitModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Productivity');
  const [frequency, setFrequency] = useState('daily');
  const [targetCount, setTargetCount] = useState(1);
  const [targetUnit, setTargetUnit] = useState('times');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || 'Productivity');
      setFrequency(initialData.frequency || 'daily');
      setTargetCount(initialData.targetCount || 1);
      setTargetUnit(initialData.targetUnit || 'times');
    } else {
      setName('');
      setDescription('');
      setCategory('Productivity');
      setFrequency('daily');
      setTargetCount(1);
      setTargetUnit('times');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      category,
      frequency,
      targetCount: Number(targetCount),
      targetUnit: targetUnit.trim(),
      targetDays: frequency === 'specific_days' ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6],
    });
    onClose();
  };

  const categories = ['Productivity', 'Mindfulness', 'Health & Fitness', 'Learning', 'Work', 'Finance', 'Personal'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{initialData ? 'Edit Habit' : 'Create Habit'}</h3>
          <button className="btn-icon-subtle" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Habit Name *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Read 20 pages or Morning stretch"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description / Purpose</label>
              <textarea
                className="textarea"
                rows="2"
                placeholder="Why does this habit matter to you?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Frequency</label>
                <select
                  className="select"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="daily">Every Day</option>
                  <option value="specific_days">Weekdays Only (Mon-Fri)</option>
                  <option value="weekly">Weekly Target</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Target Quantity</label>
                <input
                  type="number"
                  className="input"
                  min="1"
                  value={targetCount}
                  onChange={(e) => setTargetCount(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Unit</label>
                <input
                  type="text"
                  className="input"
                  placeholder="times, pages, mins"
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {initialData ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
