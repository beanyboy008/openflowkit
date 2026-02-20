import { useStore } from 'reactflow';
import { useFlowStore } from '../store';

const GUIDE_EXTENT = 100_000; // large enough to span any viewport

export const AlignmentGuides: React.FC = () => {
    const activeGuides = useFlowStore((s) => s.activeGuides);
    const transform = useStore((s) => s.transform);

    if (activeGuides.length === 0) return null;

    const [tx, ty, zoom] = transform;

    return (
        <svg
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1000,
                overflow: 'visible',
            }}
        >
            {activeGuides.map((guide, i) =>
                guide.axis === 'x' ? (
                    <line
                        key={`x-${i}`}
                        x1={guide.position * zoom + tx}
                        y1={0}
                        x2={guide.position * zoom + tx}
                        y2={GUIDE_EXTENT}
                        stroke="#6366f1"
                        strokeWidth={1}
                        strokeDasharray="6 3"
                        opacity={0.7}
                    />
                ) : (
                    <line
                        key={`y-${i}`}
                        x1={0}
                        y1={guide.position * zoom + ty}
                        x2={GUIDE_EXTENT}
                        y2={guide.position * zoom + ty}
                        stroke="#6366f1"
                        strokeWidth={1}
                        strokeDasharray="6 3"
                        opacity={0.7}
                    />
                )
            )}
        </svg>
    );
};
