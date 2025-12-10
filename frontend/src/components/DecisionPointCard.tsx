import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

export interface DecisionPoint {
    id: string;
    timestamp_seconds: number;
    decision_description: string;
    reasoning: string;
    alternatives_considered: string[];
    context_before?: string | null;
    context_after?: string | null;
    confidence_score?: number;
    user_verified?: boolean;
}

export interface DecisionPointCardProps {
    decisionPoint: DecisionPoint;
    onTimestampClick?: (timestamp: number) => void;
    className?: string;
}

/**
 * Decision point card component
 * Displays extracted decision points with reasoning
 */
export const DecisionPointCard = ({
    decisionPoint,
    onTimestampClick,
    className = '',
}: DecisionPointCardProps) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Card padding="md" className={className}>
            <div className="flex items-start justify-between gap-2 mb-3">
                <Badge color="purple" size="sm">
                    Decision Point
                </Badge>
                <button
                    onClick={() => onTimestampClick?.(decisionPoint.timestamp_seconds)}
                    className="text-sm font-medium text-edubites-primary hover:underline"
                >
                    {formatTime(decisionPoint.timestamp_seconds)}
                </button>
            </div>

            <h4 className="text-base font-semibold text-gray-900 mb-2">
                {decisionPoint.decision_description}
            </h4>

            <div className="space-y-3">
                <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Reasoning:</h5>
                    <p className="text-sm text-gray-600">{decisionPoint.reasoning}</p>
                </div>

                {decisionPoint.alternatives_considered.length > 0 && (
                    <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">
                            Alternatives Considered:
                        </h5>
                        <ul className="list-disc list-inside space-y-1">
                            {decisionPoint.alternatives_considered.map((alt, index) => (
                                <li key={index} className="text-sm text-gray-600">
                                    {alt}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {decisionPoint.context_before && (
                    <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Context:</h5>
                        <p className="text-sm text-gray-600">{decisionPoint.context_before}</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

DecisionPointCard.displayName = 'DecisionPointCard';
