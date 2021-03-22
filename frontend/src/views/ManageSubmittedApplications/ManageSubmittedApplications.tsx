import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';
import { Column, useSortBy, useTable } from 'react-table';
import Select from 'react-select';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import queryString from 'query-string';
import dayjs from 'dayjs';

import { HeadingSection, StyledH1 } from 'commonStyles';
import { acCan, refreshAccessToken } from 'util/auth';
import { handleError, handleErrorAndPush } from 'util/plazaUtils';
import { Resources } from 'security/accessControl';
import {
  ApplicationDecisions,
  Breakpoints,
  ConnectionError,
  GetApplicationsRequestParams,
  GetApplicationsResponse,
  NoPermissionError,
  RootState,
  SubmittedApplicationLite,
  UnknownError
} from 'types';
import { API_ROOT } from 'index';
import { enterApplicationReviewMode } from 'actions/applicationReview';
import { toast } from 'react-toastify';

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
  const dispatch = useDispatch();
  const history = useHistory();

  const accessToken = useSelector((state: RootState) => state.auth.jwtAccessToken);
  const reviewModeLoading = useSelector((state: RootState) => state.applicationReview.loading);
  const reviewModeEnabled = useSelector((state: RootState) => state.applicationReview.enabled);
  const reviewModeApplications = useSelector((state: RootState) => state.applicationReview.applicationNumbers);
  const userRole = useSelector((state: RootState) => state.user.role);

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
    try {
      const permission = acCan(userRole).readAny(Resources.Applications);
      if (!permission.granted) throw new NoPermissionError();
    } catch (err) {
      handleErrorAndPush(err, history);
      return;
    }

    getApplications(currentRequestParams).catch(err => {
      handleError(err);
    });
  }, [currentRequestParams]);

  useEffect(() => {
    if (reviewModeEnabled) {
      const firstApplication = reviewModeApplications[0];
      history.push(`/admin/applications/${firstApplication}`);
    }
  }, [reviewModeEnabled]);

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
      const refreshedToken = await refreshAccessToken(history);
      await getApplications(options, refreshedToken);
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

          {tableReady &&
          <EnterReviewModeButton
            onClick={() => {
              try {
                dispatch(enterApplicationReviewMode());
              } catch (err) {
                console.error(err);
                toast.error(err.message);
              }
            }}
            disabled={reviewModeLoading || totalUndecidedApplications < 1}
          >
            {reviewModeLoading ? 'Loading...' : 'Enter Review Mode'}
          </EnterReviewModeButton>
          }
        </ReviewModeContainer>
      </HeadingSection>

      <FilterSection>
        <Row>
          <StyledCol lg={6}>
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
          </StyledCol>

          <StyledCol lg={3}>
            <Select
              options={decisionOptions}
              placeholder="Filter by decision"
              onChange={(option) => {
                const decision = option ? option.value : undefined;
                setCurrentPage(1);
                setCurrentRequestParams({ ...currentRequestParams, page: 1, decision: decision });
              }}
              isClearable
            />
          </StyledCol>

          <StyledCol lg={3}>
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
          </StyledCol>
        </Row>
      </FilterSection>

      <Table responsive hover {...getTableProps}>
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
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    flex-direction: row;
    margin-top: 0;
  }
`;

const ApplicationCount = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    margin-bottom: 0;
  }
`;

const EnterReviewModeButton = styled(Button)`
  width: 100%;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    width: auto;
  }

  @media screen and (min-width: ${Breakpoints.Large}px) {
    margin-left: 1rem;
  }
`;

const FilterSection = styled.section`
  margin-bottom: 1rem;
`;

const StyledCol = styled(Col)`
  margin-bottom: 0.5rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    margin-bottom: 0;
  }
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
  flex-direction: column;
  align-items: center;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const PageIndicator = styled.div`
  margin-bottom: 1rem;
  font-weight: bold;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    margin-bottom: 0;
  }
`;

const PageButtonContainer = styled.div`
  display: flex;
`;

const NextPageButton = styled(Button)`
  margin-left: 0.5rem;
`;

export default ManageSubmittedApplications;
