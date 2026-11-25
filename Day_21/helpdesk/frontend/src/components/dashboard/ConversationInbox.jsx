
'use client';

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography
} from '@mui/material';

import {
  ChatRounded,
  ForumRounded,
  ArrowForwardRounded
} from '@mui/icons-material';

export default function ConversationInbox({
  conversations = [],
  onOpenConversation
}) {
  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={900}>
          Your inbox 💬
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Keep track of customer and internal conversations.
        </Typography>
      </Box>

      {conversations.length === 0 ? (
        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ py: 6, textAlign: 'center' }}>
            <ChatRounded
              sx={{ fontSize: 45, color: 'text.secondary', mb: 1 }}
            />

            <Typography fontWeight={800}>
              No conversations yet
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Your conversations will show up here.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {conversations.map((conversation, index) => {
            // Actual backend field: channel_type
            const isInternal =
              conversation.channel_type === 'INTERNAL';

            // Actual backend field: unread_count
            const unread = Number(conversation.unread_count || 0);

            // Actual backend field: ticket_no
            const ticketNumber =
              conversation.ticket_no ||
              `Ticket #${conversation.id}`;

            // Actual backend fields: customer_name and agent_name
            const participants = [
              conversation.customer_name,
              conversation.agent_name
            ].filter(Boolean);

            // Actual backend field: latest_message
            const message =
              conversation.latest_message ||
              'Open conversation to view messages';

            return (
              <Card
                key={`${conversation.id}-${conversation.channel_type || 'chat'}-${index}`}
                sx={{
                  borderRadius: 4,
                  transition: '0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 28px rgba(30,20,80,0.08)'
                  }
                }}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    '&:last-child': {
                      pb: 2
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      width: 46,
                      height: 46,
                      bgcolor: isInternal ? '#ff6b9d' : '#7158f5'
                    }}
                  >
                    {isInternal ? <ForumRounded /> : <ChatRounded />}
                  </Avatar>

                  <Box flex={1} minWidth={0}>
                    {/* Ticket number is the main heading */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      flexWrap="wrap"
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight={900}
                        color="text.primary"
                      >
                        {ticketNumber}
                      </Typography>

                      <Chip
                        size="small"
                        label={isInternal ? 'Internal' : 'Customer'}
                        color={isInternal ? 'secondary' : 'primary'}
                        variant="outlined"
                      />

                      {unread > 0 && (
                        <Chip
                          size="small"
                          color="error"
                          label={`${unread} new`}
                        />
                      )}
                    </Stack>

                    {/* Customer and agent names are regular weight */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={400}
                      mt={0.3}
                      noWrap
                    >
                      {participants.length > 0
                        ? participants.join(' · ')
                        : 'Conversation'}
                    </Typography>

                    {/* Latest message */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                      mt={0.5}
                    >
                      {message}
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    endIcon={<ArrowForwardRounded />}
                    onClick={() =>
                      onOpenConversation?.(conversation)
                    }
                    sx={{
                      borderRadius: 2,
                      flexShrink: 0,
                      display: {
                        xs: 'none',
                        sm: 'inline-flex'
                      }
                    }}
                  >
                    Open
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
