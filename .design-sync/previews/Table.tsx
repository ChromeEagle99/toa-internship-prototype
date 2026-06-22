import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  Badge,
} from "toa-project";

export function Invoices() {
  return (
    <div style={{ minWidth: 560 }}>
      <Table>
        <TableCaption>Recent invoices for the analytics workspace.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Issued</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">INV-2041</TableCell>
            <TableCell>Northwind Trading</TableCell>
            <TableCell>02 Jun 2026</TableCell>
            <TableCell>
              <Badge variant="success">Paid</Badge>
            </TableCell>
            <TableCell className="text-right">&pound;1,200.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">INV-2042</TableCell>
            <TableCell>Greenfield Labs</TableCell>
            <TableCell>09 Jun 2026</TableCell>
            <TableCell>
              <Badge variant="warning">Pending</Badge>
            </TableCell>
            <TableCell className="text-right">&pound;860.50</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">INV-2043</TableCell>
            <TableCell>Halcyon Media</TableCell>
            <TableCell>14 Jun 2026</TableCell>
            <TableCell>
              <Badge variant="danger">Overdue</Badge>
            </TableCell>
            <TableCell className="text-right">&pound;2,340.00</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>Total outstanding</TableCell>
            <TableCell className="text-right">&pound;3,200.50</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}

export function TeamMembers() {
  return (
    <div style={{ minWidth: 560 }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Access</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Priya Anand</TableCell>
            <TableCell>Administrator</TableCell>
            <TableCell className="text-fg-muted">priya.anand@northwind.co.uk</TableCell>
            <TableCell>
              <Badge variant="solid">Full</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Tom Whitfield</TableCell>
            <TableCell>Analyst</TableCell>
            <TableCell className="text-fg-muted">tom.whitfield@northwind.co.uk</TableCell>
            <TableCell>
              <Badge variant="subtle">Read-only</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Aisha Khan</TableCell>
            <TableCell>Editor</TableCell>
            <TableCell className="text-fg-muted">aisha.khan@northwind.co.uk</TableCell>
            <TableCell>
              <Badge variant="info">Standard</Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
