import { format } from 'date-fns';
import { Calendar, Tag, Trash2, Edit } from 'lucide-react';
import { JournalEntry } from '@/contexts/JournalContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EntryCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

const moodEmojis: Record<string, string> = {
  happy: '😊',
  calm: '😌',
  sad: '😔',
  frustrated: '😤',
  tired: '😴',
  grateful: '🤗',
  anxious: '😰',
  excited: '🤩',
};

const tagColors = [
  'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  'bg-green-500/20 text-green-700 dark:text-green-300',
  'bg-purple-500/20 text-purple-700 dark:text-purple-300',
  'bg-orange-500/20 text-orange-700 dark:text-orange-300',
  'bg-pink-500/20 text-pink-700 dark:text-pink-300',
];

export const EntryCard = ({ entry, onEdit, onDelete }: EntryCardProps) => {
  const getTagColor = (index: number) => {
    return tagColors[index % tagColors.length];
  };

  return (
    <Card className="group hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/80 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl sm:text-2xl">{moodEmojis[entry.mood]}</span>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground line-clamp-1">
                {entry.title}
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{format(new Date(entry.date), 'MMM dd, yyyy')}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onEdit(entry)}
              className="h-8 flex-1 sm:flex-none sm:w-8 sm:p-0"
            >
              <Edit className="h-4 w-4" />
              <span className="sm:hidden ml-2">Edit</span>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(entry.id)}
              className="h-8 flex-1 sm:flex-none sm:w-8 sm:p-0"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sm:hidden ml-2">Delete</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-foreground/80 mb-3 line-clamp-3">
          {entry.content}
        </p>
        {entry.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {entry.tags.map((tag, index) => (
              <Badge
                key={tag}
                variant="secondary"
                className={`${getTagColor(index)} text-xs`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
