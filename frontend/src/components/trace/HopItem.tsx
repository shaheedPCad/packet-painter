import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Hop } from '@/types';
import { getLatencyColor, formatRtt } from '@/lib/globe-utils';
import { getDatacenterShortName } from '@/lib/datacenter-utils';
import { cn } from '@/lib/utils';
import { MapPin, Clock, Cloud } from 'lucide-react';

interface HopItemProps {
  hop: Hop;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export function HopItem({ hop, index, isSelected, onSelect }: HopItemProps) {
  const latencyColor = getLatencyColor(hop.avgRtt, hop.isTimeout);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        className={cn(
          'p-4 cursor-pointer transition-all duration-200 hover:bg-accent/50 hover:scale-[1.01]',
          isSelected && 'ring-2 ring-primary bg-accent/30',
          hop.isDestination && 'border-purple-500/50'
        )}
        style={isSelected ? { boxShadow: 'var(--shadow-elevated)' } : undefined}
        onClick={onSelect}
      >
        <div className="flex items-start gap-3">
          {/* Hop number indicator */}
          <div
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: `${latencyColor}20`, color: latencyColor }}
          >
            {hop.hopNumber}
          </div>

          {/* Hop details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm truncate">
                {hop.isTimeout ? (
                  <span className="text-muted-foreground italic">No response</span>
                ) : (
                  hop.ipAddress
                )}
              </span>
              {hop.dataCenter && (
                <Badge
                  variant="secondary"
                  className="text-xs flex items-center gap-1"
                  style={{
                    backgroundColor: `${hop.dataCenter.color}20`,
                    color: hop.dataCenter.color,
                    borderColor: `${hop.dataCenter.color}40`,
                  }}
                >
                  <Cloud className="h-3 w-3" />
                  {getDatacenterShortName(hop.dataCenter.provider)}
                </Badge>
              )}
              {hop.isDestination && (
                <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300">
                  Destination
                </Badge>
              )}
            </div>

            {hop.hostname && hop.hostname !== hop.ipAddress && (
              <p className="text-xs text-muted-foreground truncate mb-1">
                {hop.hostname}
              </p>
            )}

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {hop.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {hop.location.city || hop.location.country}
                  {hop.location.countryCode && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      {hop.location.countryCode}
                    </Badge>
                  )}
                </span>
              )}
              {hop.isTimeout ? (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Timeout
                </span>
              ) : (
                <span className="flex items-center gap-1" style={{ color: latencyColor }}>
                  <Clock className="h-3 w-3" />
                  {formatRtt(hop.avgRtt)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* RTT breakdown */}
        {isSelected && hop.rtt && hop.rtt.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-border"
          >
            <div className="flex gap-2 text-xs">
              {hop.rtt.map((rtt, i) => (
                <span key={i} className="text-muted-foreground">
                  Probe {i + 1}: <span className="text-foreground">{formatRtt(rtt)}</span>
                </span>
              ))}
            </div>
          </motion.div>
        )}
        {isSelected && hop.isTimeout && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-border"
          >
            <p className="text-xs text-muted-foreground">Request timed out</p>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
