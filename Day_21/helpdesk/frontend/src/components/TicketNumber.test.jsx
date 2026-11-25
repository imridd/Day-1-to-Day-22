import {describe,it,expect} from 'vitest';
import {render,screen} from '@testing-library/react';
import TicketNumber from './TicketNumber';
describe('TicketNumber',()=>{it('renders the ticket number',()=>{render(<TicketNumber value="HD-1001"/>);expect(screen.getByText('HD-1001')).toBeInTheDocument();});});
