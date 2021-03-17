import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';
import { Column, useSortBy, useTable } from 'react-table';
import Select from 'react-select';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import queryString from 'query-string';
import dayjs from 'dayjs';

import { HeadingSection, StyledH1 } from 'commonStyles';
import { refreshAccessToken } from 'util/auth';
import {
  ApplicationDecisions,
  ConnectionError,
  NoPermissionError,
  RootState,
  SubmittedApplicationLite,
  UnknownError
} from 'types';
import { API_ROOT } from 'index';

interface GetApplicationsRequestParams {
  page?: number;
  limit?: number;
  decision?: ApplicationDecisions;
  searchQuery?: string;
}

interface GetApplicationsResponse {
  applications: SubmittedApplicationLite[];
  pages: number;
  totalApplications: number;
  totalUndecidedApplications: number;
}

interface DecisionOptionTypes {
  value: ApplicationDecisions;
  label: string;
}

interface RowsPerPageOptionTypes {
  value: number;
  label: string;
}

const decisionOptions: DecisionOptionTypes[] = [
  { value: ApplicationDecisions.Accepted, label: 'Accepted Only' },
  { value: ApplicationDecisions.Rejected, label: 'Rejected Only' },
  { value: ApplicationDecisions.Undecided, label: 'Undecided Only' }
];

const rowsPerPageOptions: RowsPerPageOptionTypes[] = [
  { value: 10, label: '10 rows' },
  { value: 25, label: '25 rows' },
  { value: 50, label: '50 rows' },
  { value: 100, label: '100 rows' },
  { value: 250, label: '250 rows' }
];

const ManageSubmittedApplications = (): JSX.Element => {
  const history = useHistory();
  const accessToken = useSelector((state: RootState) => state.auth.jwtAccessToken);

  const [tableReady, setTableReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  // Request parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [currentRequestParams, setCurrentRequestParams] = useState<GetApplicationsRequestParams>({});
  // Table data
  const [applications, setApplications] = useState<SubmittedApplicationLite[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUndecidedApplications, setTotalUndecidedApplications] = useState(0);

  useEffect(() => {
    getApplications(currentRequestParams).catch(err => {
      console.error(err);
      toast.error(err.message);
    });
  }, [currentRequestParams]);

  const tableColumns: Array<Column<SubmittedApplicationLite>> = useMemo(() => [
    {
      Header: 'Application #',
      accessor: 'applicationNumber'
    },
    {
      Header: 'First Name',
      accessor: 'firstName'
    },
    {
      Header: 'Last Name',
      accessor: 'lastName'
    },
    {
      Header: 'Email',
      accessor: 'email'
    },
    {
      Header: 'Submitted On',
      Cell: ({ value }) => {
        return dayjs(value).format('M/DD/YY, h:mm A');
      },
      accessor: 'applicationTimestamp'
    },
    {
      Header: 'Decision',
      Cell: function Decision(cell) {
        switch (cell.value) {
          case ApplicationDecisions.Accepted:
            return <span style={{ color: 'green' }}>Accepted</span>;
          case ApplicationDecisions.Rejected:
            return <span style={{ color: 'red' }}>Rejected</span>;
          case ApplicationDecisions.Undecided:
            return <span style={{ color: 'gray' }}>Undecided</span>;
          default:
            return null;
        }
      },
      accessor: 'decision'
    }
  ], []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({
    columns: tableColumns,
    data: applications
  }, useSortBy);

  const getApplications = async (options?: GetApplicationsRequestParams, overriddenAccessToken?: string) => {
    setTableReady(false);
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let queryParams = '';
    if (options) {
      queryParams = '?' + queryString.stringify(options);
    }

    let res;
    try {
      res = await fetch(`${API_ROOT}/applications${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      const resBody: GetApplicationsResponse = await res.json();

      setApplications(resBody.applications);
      setTotalPages(resBody.pages);
      setTotalUndecidedApplications(resBody.totalUndecidedApplications);

      setTableReady(true);
    } else if (res.status === 401) {
      refreshAccessToken(history)
        .then((refreshedToken) => getApplications(options, refreshedToken))
        .catch(err => toast.error(err.message));
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  return (
    <>
      <HeadingSection>
        <StyledH1>Manage Applications</StyledH1>

        <ReviewModeContainer>
          <ApplicationCount>
            {tableReady
              ? `${totalUndecidedApplications} Undecided Application${totalUndecidedApplications === 1 ? '' : 's'}`
              : 'Loading...'}
          </ApplicationCount>
          {tableReady && <ReviewButton>Enter Review Mode</ReviewButton>}
        </ReviewModeContainer>
      </HeadingSection>

      <FilterSection>
        <Row>
          <Col lg={6}>
            <SearchForm onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
              setCurrentRequestParams({ ...currentRequestParams, searchQuery: searchQuery });
            }}>
              <Form.Control name="query"
                            type="text"
                            placeholder="Search for applications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
              />

              <SearchButton variant="secondary" type="submit">Search</SearchButton>
            </SearchForm>
          </Col>

          <Col lg={3}>
            <Select
              options={decisionOptions}
              placeholder="Show only decisions"
              onChange={(option) => {
                const decision = option ? option.value : undefined;
                setCurrentPage(1);
                setCurrentRequestParams({ ...currentRequestParams, page: 1, decision: decision });
              }}
              isClearable
            />
          </Col>

          <Col lg={3}>
            <Select
              options={rowsPerPageOptions}
              placeholder="Rows per page"
              onChange={(option) => {
                const limit = option ? option.value : undefined;
                setCurrentPage(1);
                setCurrentRequestParams({ ...currentRequestParams, page: 1, limit: limit });
              }}
              isClearable
            />
          </Col>
        </Row>
      </FilterSection>

      <Table hover {...getTableProps}>
        <thead>
        {headerGroups.map((headerGroup, index) => (
          <tr {...headerGroup.getHeaderGroupProps()} key={index}>
            {headerGroup.headers.map((column, index) => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())} key={index}>
                {column.render('Header')}
                {column.isSorted
                  ? column.isSortedDesc
                    ? ' 🔽'
                    : ' 🔼'
                  : ''}
              </th>
            ))}
          </tr>
        ))}
        </thead>

        <tbody {...getTableBodyProps()}>
        {rows.map((row, index) => {
          prepareRow(row);
          return (
            <ApplicationRow {...row.getRowProps()}
                            onClick={() => history.push(`/admin/applications/${row.values.applicationNumber}`)}
                            key={index}>
              {row.cells.map((cell, index) => {
                return (
                  <td {...cell.getCellProps()} key={index}>
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </ApplicationRow>
          );
        })}
        </tbody>
      </Table>

      <PageControls>
        <PageIndicator>
          Page {currentPage} of {totalPages}
        </PageIndicator>

        <PageButtonContainer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              if (currentPage <= 1) return;

              const newPage = currentPage - 1;
              setCurrentPage(newPage);
              setCurrentRequestParams({ ...currentRequestParams, page: newPage });
            }}
            disabled={currentPage <= 1}
          >
            Previous Page
          </Button>
          <NextPageButton
            variant="outline-secondary"
            onClick={() => {
              if (currentPage >= totalPages) return;

              const newPage = currentPage + 1;
              setCurrentPage(newPage);
              setCurrentRequestParams({ ...currentRequestParams, page: newPage });
            }}
            disabled={currentPage >= totalPages}
          >
            Next Page
          </NextPageButton>
        </PageButtonContainer>
      </PageControls>
    </>
  );
};

const ReviewModeContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ApplicationCount = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
`;

const ReviewButton = styled(Button)`
  margin-left: 1rem;
`;

const FilterSection = styled.section`
  margin-bottom: 1rem;
`;

const SearchForm = styled(Form)`
  display: flex;
  flex-direction: row;
`;

const SearchButton = styled(Button)`
  margin-left: 0.5rem;
`;

const ApplicationRow = styled.tr`
  &:hover {
    cursor: pointer;
  }

  &:active {
    background-color: lightgray;
  }
`;

const PageControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PageIndicator = styled.div`
  font-weight: bold;
`;

const PageButtonContainer = styled.div`
  display: flex;
`;

const NextPageButton = styled(Button)`
  margin-left: 0.5rem;
`;

export default ManageSubmittedApplications;
